'use client';

interface HighlightProps {
  text: string;
  query: string;
}

/** 검색어를 굵게 강조 표시 */
export default function Highlight({ text, query }: HighlightProps) {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            style={{
              backgroundColor: 'rgba(255, 214, 0, 0.5)',
              borderRadius: '2px',
              color: 'inherit',
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
