import type { Metadata } from 'next';
import { Public_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './Providers';

const publicSans = Public_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SSP Migration Wizard',
  description: 'SIL Platform Configuration Tool',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={publicSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
