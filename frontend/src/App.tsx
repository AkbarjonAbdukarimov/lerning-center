import { useState } from 'react';
import { DebtorsPage } from './pages/DebtorsPage';
import { StudentsPage } from './pages/StudentsPage';

const TABS = [
  { id: 'debtors', label: 'Должники', icon: '💸' },
  { id: 'students', label: 'Ученики', icon: '👥' },
] as const;

type Tab = (typeof TABS)[number]['id'];

export default function App() {
  const [tab, setTab] = useState<Tab>('debtors');
  const title = TABS.find((t) => t.id === tab)!.label;

  return (
    <div className="mx-auto min-h-dvh max-w-2xl pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-20 bg-slate-50/90 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 backdrop-blur">
        <p className="text-xs font-medium tracking-wide text-indigo-600 uppercase">Учёт оплат</p>
        <h1 className="text-2xl font-bold">{title}</h1>
      </header>

      <main className="px-4">{tab === 'debtors' ? <DebtorsPage /> : <StudentsPage />}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto grid max-w-2xl grid-cols-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                tab === t.id ? 'text-indigo-600' : 'text-slate-500'
              }`}
              aria-current={tab === t.id ? 'page' : undefined}
            >
              <span className="text-xl">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
