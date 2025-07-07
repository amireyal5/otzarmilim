
import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

const assistant = Assistant({ subsets: ["hebrew"] });

export const metadata: Metadata = {
  title: "מערכת ניהול מטופלים",
  description: "מערכת ניהול למרכז הורות",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={assistant.className}>
        <AppProvider>
            <div id="root">{children}</div>
        </AppProvider>
      </body>
    </html>
  );
}
