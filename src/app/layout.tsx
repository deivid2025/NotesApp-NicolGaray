import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat, Patrick_Hand } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "700"],
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
    url: "https://chat.z.ai",
    siteName: "NotesApp Deivid Uchiha",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NotesApp Deivid Uchiha",
    description: "Tablero de tareas con estilo doodle, notas adhesivas y logros inspirados en Bleach.",
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
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} ${patrickHand.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
