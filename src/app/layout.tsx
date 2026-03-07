import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "SuperLog",
    template: "%s | SuperLog",
  },
  description:
    "Track your proof-of-work. Build your portfolio. SuperLog helps developers log their activities, set goals, and showcase consistent progress.",
  keywords: ["proof of work", "developer portfolio", "activity tracking", "goals", "productivity"],
  authors: [{ name: "SuperLog" }],
  creator: "SuperLog",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SuperLog",
    title: "SuperLog",
    description:
      "Track your proof-of-work. Build your portfolio.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SuperLog",
    description: "Track your proof-of-work. Build your portfolio.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
