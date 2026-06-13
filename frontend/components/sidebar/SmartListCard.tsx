'use client';

import Link from 'next/link';

interface SmartListCardProps {
  id: string;
  label: string;
  icon: string;
  count: number;
  color: string;
  fullWidth?: boolean;
}

export default function SmartListCard({
  id,
  label,
  icon,
  count,
  color,
  fullWidth = false,
}: SmartListCardProps) {
  return (
    <Link
      href={`/list/${id}`}
      className={`
        flex flex-col justify-between p-3 rounded-xl cursor-pointer
        hover:scale-[1.02] transition-transform duration-150
        ${fullWidth ? 'col-span-2' : ''}
      `}
      style={{ backgroundColor: `${color}18` }}
    >
      <div className="flex justify-between items-start">
        <span className="text-2xl" style={{ color }}>{icon}</span>
        <span
          className="text-2xl font-bold leading-none"
          style={{ color }}
        >
          {count}
        </span>
      </div>
      <span
        className="text-sm font-semibold mt-2"
        style={{ color }}
      >
        {label}
      </span>
    </Link>
  );
}
