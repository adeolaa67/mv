import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Mea_Culpa } from "next/font/google";
import "./globals.css";

const displaySerif = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const bodySerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const script = Mea_Culpa({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});

export const metadata: Metadata = {
  title: "MV Hair UK | Book an Appointment",
  description: "Book your appointment with Victoria, Luxury Extensions Specialist in Selly Oak, Birmingham.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${displaySerif.variable} ${bodySerif.variable} ${script.variable} font-body bg-cream text-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
