import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Katsuyo Coach · Japanese Conjugation Trainer",
  description: "Practice Japanese polite conjugations with smart feedback.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
