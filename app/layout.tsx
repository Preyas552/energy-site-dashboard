import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Energy Site Selector",
  description: "Interactive solar energy site selection using fuzzy TOPSIS analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
