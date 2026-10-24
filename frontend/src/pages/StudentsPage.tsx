import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, Payment, Student } from '../api';
import { Sheet } from '../components/Sheet';
import { StudentForm } from '../components/StudentForm';
import { useToast } from '../components/Toast';
import { formatDate, formatMoney } from '../format';

type Editing = { student?: Student } | null;

export function StudentsPage() {
  const toast = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Editing>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);

  const load = useCallback(async () => {
    try {
      setStudents(await api.students());
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => `${s.name} ${s.group} ${s.phone} ${s.id}`.toLowerCase().includes(q));
  }, [students, search]);

  async function toggle(id: number) {
    if (expanded === id) return setExpanded(null);
    setExpanded(id);
    setPayments(null);
    try {
      setPayments(await api.payments(id));
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  }

  async function remove(s: Student) {
    if (!confirm(`Удалить ученика «${s.name}» вместе со всеми оплатами?`)) return;
    try {
      await api.deleteStudent(s.id);
      toast('Ученик удалён');
      setExpanded(null);
      load();
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          className="input"
          type="search"
          placeholder="Поиск по имени, группе, телефону"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-primary shrink-0" onClick={() => setEditing({})} aria-label="Добавить ученика">
          +
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-slate-400">Загрузка…</p>
      ) : filtered.length === 0 ? (
        <p className="card py-10 text-center text-slate-500">{students.length ? 'Ничего не найдено' : 'Учеников пока нет'}</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((s) => (
            <li key={s.id} className="card">
              <button className="flex w-full items-start justify-between gap-3 text-left" onClick={() => toggle(s.id)}>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{s.name}</p>
                  <p className="text-sm text-slate-500">
                    #{s.id} · {s.group} · {s.phone}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold">{formatMoney(s.monthlyFee)}</p>
                  <p className="text-xs text-slate-500">в месяц</p>
                </div>
              </button>

              {expanded === s.id && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="mb-2 text-sm font-medium text-slate-600">История оплат</p>
                  {payments === null ? (
                    <p className="text-sm text-slate-400">Загрузка…</p>
                  ) : payments.length === 0 ? (
                    <p className="text-sm text-slate-400">Оплат нет</p>
                  ) : (
                    <ul className="max-h-48 divide-y divide-slate-100 overflow-y-auto text-sm">
                      {payments.map((p) => (
                        <li key={p.id} className="flex justify-between py-1.5">
                          <span className="text-slate-500">{formatDate(p.date)}</span>
                          <span className="font-medium">{formatMoney(p.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button className="btn-secondary py-2.5" onClick={() => setEditing({ student: s })}>
                      Изменить
                    </button>
                    <button className="btn-danger py-2.5" onClick={() => remove(s)}>
                      Удалить
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <Sheet title={editing.student ? 'Редактировать ученика' : 'Новый ученик'} onClose={() => setEditing(null)}>
          <StudentForm
            student={editing.student}
            onDone={() => {
              setEditing(null);
              load();
            }}
          />
        </Sheet>
      )}
    </div>
  );
}
