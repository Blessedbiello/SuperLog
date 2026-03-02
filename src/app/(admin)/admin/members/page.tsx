import { prisma } from "@/lib/prisma";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function AdminMembersPage() {
  const members = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, image: true, role: true,
      githubUsername: true, level: true, xp: true, createdAt: true,
      _count: { select: { githubActivities: true, weeklyReports: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Members</h2>
        <p className="text-sm text-gray-500">{members.length} total members</p>
      </div>

      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Activities</TableHead>
              <TableHead>Reports</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <Link href={`/admin/members/${m.id}`} className="flex items-center gap-3 hover:text-emerald-600">
                    <Avatar src={m.image} name={m.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.email}</p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={m.role === "ADMIN" ? "info" : "default"}>{m.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="success">Lv.{m.level}</Badge>
                </TableCell>
                <TableCell>{m._count.githubActivities}</TableCell>
                <TableCell>{m._count.weeklyReports}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  {m.createdAt.toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
