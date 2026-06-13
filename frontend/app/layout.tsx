import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import Sidebar from '@/components/sidebar/Sidebar';
import DetailPanel from '@/components/reminder/DetailPanel';
import ToastContainer from '@/components/ui/Toast';
import KeyboardHandler from '@/components/KeyboardHandler';
import MobileHeader from '@/components/MobileHeader';

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
          {/* 키보드 단축키 핸들러 */}
          <KeyboardHandler />

          {/* 사이드바 — 데스크탑: 260px 고정, 모바일: 드로어 오버레이 */}
          <div
            className="hidden md:block w-[260px] flex-shrink-0 h-full border-r"
            style={{ borderColor: 'var(--separator)' }}
          >
            <Sidebar />
          </div>

          {/* 모바일 드로어 */}
          <MobileDrawer />

          {/* 메인 컨텐츠 */}
          <div className="flex flex-col flex-1 h-full overflow-hidden">
            {/* 모바일 상단바 */}
            <MobileHeader />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>

          {/* 상세 패널 */}
          <DetailPanel />

          {/* 토스트 알림 */}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}

// 모바일 드로어 (클라이언트 컴포넌트는 별도 파일로)
function MobileDrawer() {
  // 실제 드로어 로직은 MobileHeader/MobileDrawerPanel에서 처리
  return null;
}
