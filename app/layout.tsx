import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ReportConnect - Report Card Automation',
  description: 'Upload, generate, and send student marksheets to parents',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-white/10">
          <div className="container-page py-4 flex items-center justify-between">
            <Link href="/" className="font-semibold text-white text-lg">
              <span className="px-2 py-1 rounded-md bg-brand-500/20 text-brand-200 border border-brand-500/30">Report</span>
              <span className="ml-1">Connect</span>
            </Link>
            <nav className="text-sm text-white/70">
              <a href="https://vercel.com" target="_blank" className="hover:text-white">Deploy</a>
            </nav>
          </div>
        </header>
        <main className="container-page py-8">
          {children}
        </main>
        <footer className="container-page py-6 text-xs text-white/60 border-t border-white/10">
          Built with Next.js and Tailwind CSS
        </footer>
      </body>
    </html>
  );
}
