import "./globals.css";
import NavBar from "@/components/layouts/NavBar";
import { Fredoka } from 'next/font/google';
import { Toaster } from "@/components/ui/sonner";

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
    <html lang="en" className={fredoka.variable}>
      <body>
        <NavBar />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}