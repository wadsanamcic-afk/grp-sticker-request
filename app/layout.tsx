import type { Metadata } from "next";
import "./globals.css";
import "./workflow.css";
import "./portal.css";

export const metadata: Metadata = {
  title: "ระบบขอออกแบบและผลิตสติ๊กเกอร์",
  description: "แบบฟอร์มขอออกแบบและผลิตสติ๊กเกอร์ ชริ้ง ป้ายกล่องไฟ และไวนิล",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  );
}
