interface CSVActivity {
  date: string;
  type: string;
  title: string;
  url: string;
  project: string;
  points: number;
}

export function generateReportCSV(activities: CSVActivity[]): string {
  const header = "Date,Type,Title,URL,Project,Points";
  const rows = activities.map((a) => {
    const escapeCsv = (s: string) => {
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    return [
      a.date,
      a.type,
      escapeCsv(a.title),
      a.url || "",
      escapeCsv(a.project || ""),
      a.points.toString(),
    ].join(",");
  });

  return [header, ...rows].join("\n");
}
