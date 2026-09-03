import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caries Urbanas · Observatorio Urbano de Santa Fe",
  description: "Observatorio de inmuebles abandonados, terrenos baldíos y estructuras en peligro en Santa Fe, Argentina. Concejal Lucas Simoniello · #Encuentro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
