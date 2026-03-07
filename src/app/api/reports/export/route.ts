import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/utils/api-response";
import { generateReportCSV } from "@/lib/reports/csv-export";
import { renderToBuffer } from "@react-pdf/renderer";
import { generateReportPDF } from "@/lib/reports/pdf-export";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";
  const weekStart = searchParams.get("weekStart");

  if (!weekStart) return errorResponse("weekStart is required", 400);

  const report = await prisma.weeklyReport.findFirst({
    where: { userId: session.user.id, weekStart: new Date(weekStart) },
    include: { user: { select: { name: true } } },
  });

  if (!report) return errorResponse("Report not found", 404);

  if (format === "pdf") {
    const summary = report.summary as Parameters<typeof generateReportPDF>[0]["summary"];
    const pdfElement = generateReportPDF({
      ...report,
      summary,
    });
    const buffer = await renderToBuffer(pdfElement);
    const pdfBytes = new Uint8Array(buffer);
    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="report-${weekStart}.pdf"`,
      },
    });
  }

  // CSV
  const activities = await prisma.gitHubActivity.findMany({
    where: {
      userId: session.user.id,
      occurredAt: { gte: new Date(weekStart), lte: report.weekEnd },
    },
    include: { project: { select: { name: true } } },
    orderBy: { occurredAt: "desc" },
  });

  const csvData = activities.map((a) => ({
    date: a.occurredAt.toISOString().split("T")[0],
    type: a.type,
    title: a.title,
    url: a.url || "",
    project: a.project?.name || "",
    points: 0,
  }));

  const csv = generateReportCSV(csvData);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="report-${weekStart}.csv"`,
    },
  });
}
