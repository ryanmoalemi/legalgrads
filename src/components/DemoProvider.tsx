'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { DEMO_IDS } from '@/lib/catalog';
import { acceptTerms, currentActor, getUser, initDb, needsReconsent, readSession, subscribe, writeSession } from '@/lib/db';
import type { User } from '@/lib/types';

interface DemoContextValue {
  ready: boolean;
  user: User | null;
  rev: number;
  switchUser: (id: string | null) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function useDemo(): DemoContextValue {
  const value = useContext(DemoContext);
  if (!value) throw new Error('DemoProvider missing');
  return value;
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [rev, setRev] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    initDb().then(() => {
      if (!alive) return;
      setUserId(readSession());
      setReady(true);
    });
    const unsub = subscribe(() => setRev((n) => n + 1));
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  const user = ready && userId ? getUser(userId) : null;

  function switchUser(id: string | null) {
    writeSession(id);
    setUserId(id);
  }

  return (
    <DemoContext.Provider value={{ ready, user, rev, switchUser }}>
      {children}
      {ready && user && needsReconsent(user.id) ? <Reconsent user={user} onDone={() => setRev((n) => n + 1)} /> : null}
    </DemoContext.Provider>
  );
}

function Reconsent({ user, onDone }: { user: User; onDone: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-navy/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="reconsent-title">
      <form
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-card"
        onSubmit={(event) => {
          event.preventDefault();
          const actor = currentActor() ?? { id: user.id, role: user.role };
          acceptTerms(actor);
          onDone();
        }}
      >
        <p className="demo-pill">DRAFT</p>
        <h2 id="reconsent-title" className="mt-3 font-display text-2xl font-extrabold">The draft terms changed</h2>
        <p className="mt-2 text-sm text-ink">Accept the new draft version to keep using this demo account. This is not a production contract.</p>
        <button type="submit" className="mt-4 rounded-full bg-pink px-5 py-3 font-display text-sm font-semibold text-white">Accept updated draft</button>
      </form>
    </div>
  );
}

export function actorFrom(user: User | null) {
  return user ? { id: user.id, role: user.role } : null;
}

export { DEMO_IDS };
