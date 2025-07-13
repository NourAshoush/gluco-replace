import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ConfirmationProvider } from "@/context/ConfirmationContext";
import { LanguageProvider } from "@/context/LanguageContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Dexcom Patient Support",
    description: "Dexcom Glucose Meter Support System.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <LanguageProvider>
                    <ConfirmationProvider>{children}</ConfirmationProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
