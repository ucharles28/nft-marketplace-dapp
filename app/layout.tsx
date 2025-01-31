import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import { headers } from "next/headers";
import BaseComponent from './components/BaseComponent';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Metaverse Marketplace",
  description: "Your one stop NFT Marketplace",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = (await headers()).get("cookie");

  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <Providers cookie={cookie}>
          <BaseComponent>
            {children}
          </BaseComponent>
        </Providers>
      </body>
    </html>
  );
}
