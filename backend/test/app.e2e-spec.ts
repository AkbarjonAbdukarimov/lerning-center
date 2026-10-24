import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { currentMonth } from '../src/common/dates';
import { setupApp } from '../src/setup-app';

/** Requires a running Postgres with migrations applied (DATABASE_URL). */
describe('Payments flow (e2e)', () => {
  let app: INestApplication;
  let studentId: number;
  const month = currentMonth();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    if (studentId) await request(app.getHttpServer()).delete(`/students/${studentId}`);
    await app.close();
  });

  const findDebtor = async () => {
    const res = await request(app.getHttpServer()).get(`/debtors?month=${month}`).expect(200);
    return res.body.debtors.find((d: { id: number }) => d.id === studentId);
  };

  it('creates a student', async () => {
    const res = await request(app.getHttpServer())
      .post('/students')
      .send({ name: 'E2E Student', phone: '+998901234567', group: 'E2E', monthlyFee: 1000 })
      .expect(201);
    studentId = res.body.id;
    expect(res.body.monthlyFee).toBe(1000);
  });

  it('rejects invalid input', async () => {
    await request(app.getHttpServer()).post('/students').send({ name: '', phone: 'x', group: 'G', monthlyFee: -1 }).expect(400);
    await request(app.getHttpServer()).post('/payments').send({ studentId, amount: 0 }).expect(400);
    await request(app.getHttpServer()).post('/payments').send({ studentId: 999999, amount: 10 }).expect(404);
    await request(app.getHttpServer()).get('/debtors?month=2024-13').expect(400);
  });

  it('shows the student as a full debtor before any payment', async () => {
    expect(await findDebtor()).toMatchObject({ paid: 0, debt: 1000 });
  });

  it('reduces the debt after a partial payment', async () => {
    await request(app.getHttpServer()).post('/payments').send({ studentId, amount: 400, date: `${month}-01` }).expect(201);
    expect(await findDebtor()).toMatchObject({ paid: 400, debt: 600 });
  });

  it('removes the student from debtors once paid in full', async () => {
    await request(app.getHttpServer()).post('/payments').send({ studentId, amount: 600 }).expect(201);
    expect(await findDebtor()).toBeUndefined();
  });

  it('lists payments by student', async () => {
    const res = await request(app.getHttpServer()).get(`/students/${studentId}/payments`).expect(200);
    expect(res.body).toHaveLength(2);
    const res2 = await request(app.getHttpServer()).get(`/payments?studentId=${studentId}`).expect(200);
    expect(res2.body).toEqual(res.body);
  });
});
