import { FormEvent, useState } from 'react';
import { api, Student } from '../api';
import { useToast } from './Toast';

interface Props {
  student?: Student;
  onDone: () => void;
}

export function StudentForm({ student, onDone }: Props) {
  const toast = useToast();
  const [name, setName] = useState(student?.name ?? '');
  const [phone, setPhone] = useState(student?.phone ?? '');
  const [group, setGroup] = useState(student?.group ?? '');
  const [fee, setFee] = useState(student ? String(student.monthlyFee) : '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const monthlyFee = Number(fee.replace(',', '.').replace(/\s/g, ''));
    if (!name.trim() || !group.trim()) return setError('Заполните имя и группу');
    if (!/^\+?[0-9\s\-()]{7,20}$/.test(phone.trim())) return setError('Некорректный телефон');
    if (!Number.isFinite(monthlyFee) || monthlyFee <= 0) return setError('Месячная сумма должна быть больше нуля');

    setError('');
    setSaving(true);
    const data = { name: name.trim(), phone: phone.trim(), group: group.trim(), monthlyFee };
    try {
      if (student) await api.updateStudent(student.id, data);
      else await api.createStudent(data);
      toast(student ? 'Ученик обновлён' : 'Ученик добавлен');
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <label className="label" htmlFor="st-name">
          Имя
        </label>
        <input id="st-name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
      </div>
      <div>
        <label className="label" htmlFor="st-phone">
          Телефон
        </label>
        <input
          id="st-phone"
          type="tel"
          className="input"
          placeholder="+998 90 123-45-67"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="st-group">
            Группа
          </label>
          <input id="st-group" className="input" value={group} onChange={(e) => setGroup(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="st-fee">
            Сумма в месяц
          </label>
          <input id="st-fee" className="input" inputMode="decimal" value={fee} onChange={(e) => setFee(e.target.value)} />
        </div>
      </div>

      {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <button type="submit" className="btn-primary w-full" disabled={saving}>
        {saving ? 'Сохранение…' : student ? 'Сохранить' : 'Добавить ученика'}
      </button>
    </form>
  );
}
