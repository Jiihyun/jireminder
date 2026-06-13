'use client';

interface CircleButtonProps {
  checked: boolean;
  color: string;
  size?: number;
  onClick: () => void;
}

export default function CircleButton({
  checked,
  color,
  size = 20,
  onClick,
}: CircleButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="flex-shrink-0 rounded-full border-2 flex items-center justify-center
        transition-all duration-150 group"
      style={{
        width: size,
        height: size,
        borderColor: color,
        backgroundColor: checked ? color : 'transparent',
      }}
    >
      {checked ? (
        /* 완료 체크마크 */
        <svg
          width={size * 0.55}
          height={size * 0.55}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2 6l3 3 5-5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="14"
            strokeDashoffset="0"
            style={{ transition: 'stroke-dashoffset 150ms ease' }}
          />
        </svg>
      ) : (
        /* hover 시 반투명 채우기 */
        <span
          className="rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-150"
          style={{
            width: size - 6,
            height: size - 6,
            backgroundColor: color,
          }}
        />
      )}
    </button>
  );
}
