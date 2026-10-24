import { FormEvent, useState } from 'react';
import { api, Student } from '../api';
import { formatMoney, todayIso } from '../format';
import { useToast } from './Toast';

interface Props {
  students: Student[];
  initialStudentId?: number;
  initialAmount?: number;
  onDone: () => void;
}

export function PaymentForm({ students, initialStudentId, initialAmount, onDone }: Props) {
  const toast = useToast();
  const [studentId, setStudentId] = useState(initialStudentId ? String(initialStudentId) : '');
  const [amount, setAmount] = useState(initialAmount ? String(initialAmount) : '');
  const [date, setDate] = useState(todayIso());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const selected = students.find((s) => s.id === Number(studentId));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const value = Number(amount.replace(',', '.').replace(/\s/g, ''));
    if (!studentId) return setError('Выберите ученика');
    if (!Number.isFinite(value) || value <= 0) return setError('Сумма должна быть больше нуля');
    if (!date) return setError('Укажите дату');

    setError('');
    setSaving(true);
    try {
      await api.createPayment({ studentId: Number(studentId), amount: Math.round(value * 100) / 100, date });
      toast(`Оплата ${formatMoney(value)} внесена: ${selected?.name ?? ''}`);
      onDone();
    } catch (err) {
      setError((err as Error).message);
      toast('Не удалось сохранить оплату', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <label className="label" htmlFor="pay-student">
          Ученик
        </label>
        <select id="pay-student" className="input" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          <option value="">— выберите —</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              #{s.id} {s.name} · {s.group}
            </option>
          ))}
        </select>
        {selected && (
          <p className="mt-1 text-sm text-slate-500">Месячная сумма: {formatMoney(selected.monthlyFee)}</p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="pay-amount">
          Сумма
        </label>
        <input
          id="pay-amount"
          className="input"
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="pay-date">
          Дата
        </label>
        <input id="pay-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <button type="submit" className="btn-primary w-full" disabled={saving}>
        {saving ? 'Сохранение…' : 'Внести оплату'}
      </button>
    </form>
  );
}
