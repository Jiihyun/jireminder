// Phase 7에서 API 연동 예정
export default function ListPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-secondary)' }}>
      <p className="text-sm">리마인더를 불러오는 중...</p>
    </div>
  );
}
