'use client';

import type { ListColor } from '@/types';

const COLORS: { value: ListColor; hex: string }[] = [
  { value: 'RED', hex: '#ff3b30' },
  { value: 'ORANGE', hex: '#ff9500' },
  { value: 'YELLOW', hex: '#ffcc00' },
  { value: 'GREEN', hex: '#34c759' },
  { value: 'TEAL', hex: '#5ac8fa' },
  { value: 'BLUE', hex: '#007aff' },
  { value: 'INDIGO', hex: '#5856d6' },
  { value: 'PURPLE', hex: '#af52de' },
  { value: 'PINK', hex: '#ff2d55' },
  { value: 'BROWN', hex: '#a2845e' },
];

export const COLOR_HEX: Record<ListColor, string> = Object.fromEntries(
  COLORS.map(({ value, hex }) => [value, hex])
) as Record<ListColor, string>;

interface ColorPickerProps {
  value: ListColor;
  onChange: (color: ListColor) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {COLORS.map(({ value: color, hex }) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className="w-7 h-7 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
          style={{ backgroundColor: hex }}
          title={color}
        >
          {value === color && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6l3 3 5-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
