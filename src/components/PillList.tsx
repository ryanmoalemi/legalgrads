/** Practice-area chips as a real list, so the words do not run together. */
export function PillList({ items, className = '' }: { items: string[]; className?: string }) {
  if (!items.length) return null;
  return (
    <ul className={`m-0 flex list-none flex-wrap gap-1 p-0 ${className}`}>
      {items.map((item) => (
        <li key={item} className="rounded-full bg-[#F4EEFF] px-2 py-1 text-xs font-semibold text-purple">{item}</li>
      ))}
    </ul>
  );
}
