import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepostFlow — Repost management, made clear",
  description:
    "A private workspace for tracking TikTok reposts and completing a user-assisted removal workflow.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
