import type { Metadata } from "next";
import { Lora, Nunito_Sans } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const nunitoSans = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito-sans" });

export const metadata: Metadata = {
  title: "Inforia - Asistente Clínico con IA",
  description: "Recupera tu vocación. Nosotros nos encargamos del papeleo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${lora.variable} ${nunitoSans.variable}`}>
      <body className="min-h-screen bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
