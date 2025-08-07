import type { Metadata } from "next";
import "./globals.css"; // Assuming globals.css exists from the previous setup

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
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
