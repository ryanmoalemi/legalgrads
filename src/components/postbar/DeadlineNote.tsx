'use client';

/** California deadlines are compared in Pacific time so a static page stays current in the browser. */
export function deadlinePassed(iso: string, now = Date.now()): boolean {
  return now > new Date(`${iso}T23:59:59-08:00`).getTime();
}

export function DeadlineNote({ iso, children }: { iso: string; children: React.ReactNode }) {
  const passed = deadlinePassed(iso);
  return (
    <p data-testid={`deadline-${iso}`} data-status={passed ? 'passed' : 'upcoming'}>
      <b className="text-navy">{passed ? 'Passed' : 'Upcoming'}:</b> {children}
    </p>
  );
}
