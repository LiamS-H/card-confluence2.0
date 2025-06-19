import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "react-scrycards/dist/index.css";
import { NavBar } from "./navbar";
import { Providers } from "./providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "CardConfluence",
    description: "Rich scrycards query editor.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className="w-full h-full">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased w-full h-full flex flex-col`}
            >
                <Providers>
                    <NavBar />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
