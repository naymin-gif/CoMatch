import type { Metadata } from 'next';
import { Crimson_Pro, Young_Serif, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import NavigationBar from '@/components/layouts/NavigationBar';

// fonts
const fontPrimary = Crimson_Pro({ 
  subsets: ['latin'],
  variable: '--font-crimson', 
  display: 'swap',
});

const fontHeading = Young_Serif({
  weight: ['400'], 
  subsets: ['latin'],
  variable: '--font-young-serif',
  display: 'swap',
});

const fontQuote = Cormorant_Garamond({
  weight: ['400', '600'], // You can add multiple weights if you want bold italics
  style: ['italic'],      // Italics are now supported!
  subsets: ['latin'],
  variable: '--font-cormorant', // Keep the same variable name so CSS doesn't break
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CoMatch',
  description: 'Connect. Collaborate. Conquer.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fontPrimary.variable} ${fontHeading.variable} ${fontQuote.variable}`}>
      <body className={`font-primary bg-comatch-background text-slate-900 min-h-screen pb-24 antialiased`}>
        <main>{children}</main>
        <NavigationBar />
      </body>
    </html>
  );
}