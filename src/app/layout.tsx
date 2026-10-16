import type { Metadata } from "next";
import { Inter, Gochi_Hand, Patrick_Hand } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["700"],
});

const gochiHand = Gochi_Hand({
  variable: "--font-gochi-hand",
  subsets: ["latin"],
  weight: "400",
});

const patrickHand = Patrick_Hand({
  variable: "--font-patrick-hand",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "NotesApp Deivid Uchiha — Tablero de Tareas",
  description: "Tablero de tareas con estilo doodle, notas adhesivas y logros inspirados en Bleach.",
  keywords: ["tablero", "tareas", "notas", "productividad", "Bleach", "Deivid Uchiha"],
  authors: [{ name: "Deivid Uchiha" }],
  icons: {
    icon: "/app-icon.png",
    apple: "/app-icon.png",
  },
  openGraph: {
    title: "NotesApp Deivid Uchiha",
    description: "Tablero de tareas con estilo doodle, notas adhesivas y logros inspirados en Bleach.",
    url: "https://github.com/deivid2025/NotesApp-NicolGaray",
    siteName: "NotesApp Deivid Uchiha",
    type: "website",
    images: [{ url: "/app-icon.png", width: 1024, height: 1024, alt: "NotesApp Deivid Uchiha" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NotesApp Deivid Uchiha",
    description: "Tablero de tareas con estilo doodle, notas adhesivas y logros inspirados en Bleach.",
    images: ["/app-icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${gochiHand.variable} ${patrickHand.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
