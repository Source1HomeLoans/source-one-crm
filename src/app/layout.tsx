import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Source One Mortgage CRM",
  description: "A secure mortgage CRM for Source One Home Loans."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
