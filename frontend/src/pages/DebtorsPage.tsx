import { useCallback, useEffect, useState } from 'react';
import { api, Debtor, DebtorsReport, Student } from '../api';
import { PaymentForm } from '../components/PaymentForm';
import { Sheet } from '../components/Sheet';
import { useToast } from '../components/Toast';
import { currentMonth, formatMoney, formatMonth, shiftMonth } from '../format';

type PayTarget = { debtor?: Debtor } | null;

export function DebtorsPage() {
  const toast = useToast();
  const [month, setMonth] = useState(currentMonth());
  const [report, setReport] = useState<DebtorsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [payTarget, setPayTarget] = useState<PayTarget>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReport(await api.debtors(month));
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }, [month, toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function openPayment(debtor?: Debtor) {
    try {
      setStudents(await api.students());
      setPayTarget({ debtor });
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  }

  return (
    <div className="space-y-4">
      <div className="card flex items-center gap-2 p-2">
        <button className="btn-secondary px-3" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Предыдущий месяц">
          ‹
        </button>
        <label className="relative flex-1 text-center">
          <span className="font-semibold">{formatMonth(month)}</span>
          <input
            type="month"
            value={month}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Выбрать месяц"
          />
        </label>
        <button className="btn-secondary px-3" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Следующий месяц">
          ›
        </button>
      </div>

      {report && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-sm text-slate-500">Должников</p>
            <p className="text-2xl font-bold">{report.count}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Общий долг</p>
            <p className="text-2xl font-bold text-rose-600">{formatMoney(report.totalDebt)}</p>
          </div>
        </div>
      )}

      {loading && !report ? (
        <p className="py-10 text-center text-slate-400">Загрузка…</p>
      ) : report?.debtors.length === 0 ? (
        <div className="card py-10 text-center">
          <p className="text-4xl">🎉</p>
          <p className="mt-2 font-medium">Должников нет</p>
          <p className="text-sm text-slate-500">Все оплатили за {formatMonth(month).toLowerCase()}</p>
        </div>
      ) : (
        <ul className={`space-y-3 transition-opacity ${loading ? 'opacity-50' : ''}`}>
          {report?.debtors.map((d) => (
            <li key={d.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{d.name}</p>
                  <p className="text-sm text-slate-500">
                    #{d.id} · {d.group} ·{' '}
                    <a href={`tel:${d.phone.replace(/[^\d+]/g, '')}`} className="text-indigo-600">
                      {d.phone}
                    </a>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-bold text-rose-600">{formatMoney(d.debt)}</p>
                  <p className="text-xs text-slate-500">
                    {formatMoney(d.paid)} из {formatMoney(d.monthlyFee)}
                  </p>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-emerald-500" style={{ width: `${(d.paid / d.monthlyFee) * 100}%` }} />
              </div>
              <button className="btn-primary mt-3 w-full py-2.5" onClick={() => openPayment(d)}>
                Внести оплату
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        className="btn-primary fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 rounded-full px-5 shadow-lg"
        onClick={() => openPayment()}
      >
        + Оплата
      </button>

      {payTarget && (
        <Sheet title="Новая оплата" onClose={() => setPayTarget(null)}>
          <PaymentForm
            students={students}
            initialStudentId={payTarget.debtor?.id}
            initialAmount={payTarget.debtor?.debt}
            onDone={() => {
              setPayTarget(null);
              load();
            }}
          />
        </Sheet>
      )}
    </div>
  );
}
