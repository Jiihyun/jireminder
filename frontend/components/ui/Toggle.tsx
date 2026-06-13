'use client';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: string;
}

export default function Toggle({ checked, onChange, color = '#007aff' }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
      style={{ backgroundColor: checked ? color : '#e5e5ea' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm
          transition-transform duration-200"
        style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  );
}
