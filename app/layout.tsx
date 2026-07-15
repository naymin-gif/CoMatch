import "./globals.css";
import NavBar from "@/components/layouts/NavBar";
import { Fredoka, Geist } from 'next/font/google';
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <NavBar />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}