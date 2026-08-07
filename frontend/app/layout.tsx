import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "REGNViking OS - Empire Dashboard",
  description: "ROI, inventions, patents and agent status for REGNViking OS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
