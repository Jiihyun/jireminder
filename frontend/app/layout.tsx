import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import Sidebar from '@/components/sidebar/Sidebar';

export const metadata: Metadata = {
  title: 'JihyunReminder',
  description: 'Apple Reminder 웹 버전',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="flex h-full antialiased">
        <Providers>
          {/* 사이드바 — 260px 고정 */}
          <div
            className="w-[260px] flex-shrink-0 h-full border-r"
            style={{ borderColor: 'var(--separator)' }}
          >
            <Sidebar />
          </div>

          {/* 메인 컨텐츠 */}
          <main className="flex-1 h-full overflow-auto">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
