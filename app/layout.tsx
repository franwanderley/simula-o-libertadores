import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "6 a 3 | Simulador da Copa Libertadores da América",
  description: "Monte o seu elenco dos sonhos no Draft, defina a sua formação tática, monte sua estratégia de jogo e simule toda a Copa Libertadores da América até a grande final em busca da Glória Eterna!",
  keywords: ["Futebol", "Libertadores", "Copa Libertadores", "Simulador de Futebol", "Draft de Futebol", "6 a 3", "Simulador Libertadores", "Glória Eterna", "Gerenciador de Futebol"],
  authors: [{ name: "6 a 3 Libertadores Sim" }],
  openGraph: {
    title: "6 a 3 | Simulador da Copa Libertadores da América",
    description: "Monte seu elenco no Draft, monte sua estratégia e simule toda a Copa Libertadores da América até a grande final!",
    type: "website",
    locale: "pt_BR",
    siteName: "6 a 3 Libertadores Sim",
  },
  twitter: {
    card: "summary_large_image",
    title: "6 a 3 | Simulador da Copa Libertadores da América",
    description: "Monte seu elenco no Draft, monte sua estratégia e simule toda a Copa Libertadores da América até a grande final!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
