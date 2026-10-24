const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export interface Student {
  id: number;
  name: string;
  phone: string;
  group: string;
  monthlyFee: number;
  createdAt: string;
}

export type StudentInput = Pick<Student, 'name' | 'phone' | 'group' | 'monthlyFee'>;

export interface Payment {
  id: number;
  studentId: number;
  amount: number;
  date: string;
}

export interface Debtor {
  id: number;
  name: string;
  phone: string;
  group: string;
  monthlyFee: number;
  paid: number;
  debt: number;
}

export interface DebtorsReport {
  month: string;
  count: number;
  totalDebt: number;
  debtors: Debtor[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new ApiError(message || `Ошибка ${res.status}`, res.status);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const api = {
  debtors: (month: string) => request<DebtorsReport>(`/debtors?month=${encodeURIComponent(month)}`),

  students: () => request<Student[]>('/students'),
  createStudent: (data: StudentInput) => request<Student>('/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id: number, data: StudentInput) =>
    request<Student>(`/students/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteStudent: (id: number) => request<void>(`/students/${id}`, { method: 'DELETE' }),

  payments: (studentId: number) => request<Payment[]>(`/students/${studentId}/payments`),
  createPayment: (data: { studentId: number; amount: number; date: string }) =>
    request<Payment>('/payments', { method: 'POST', body: JSON.stringify(data) }),
};
