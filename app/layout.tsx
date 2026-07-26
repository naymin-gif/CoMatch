import './globals.css';
import NavBar from '@/components/layouts/NavBar';
import { Fredoka } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import localFont from 'next/font/local';

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
});

const featherBold = localFont({
  src: '../public/fonts/featherbolds.woff',
  variable: '--font-feather-bold',
  weight: '700',
  style: 'normal',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${featherBold.variable}`}
    >
      <body>
        <NavBar />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
