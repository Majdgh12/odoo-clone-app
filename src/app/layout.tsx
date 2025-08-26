import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Employee Management System",
  description: "A comprehensive employee management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased font-sans"
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}