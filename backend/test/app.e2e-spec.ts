import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface AuthRes {
  access_token: string;
  refresh_token: string;
  user: { id: string; email: string; role: string };
}

describe('On thi 2029 e2e', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const appModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = appModule.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    // LÆ°u Ã½: test cháº¡y trÃªn DB dev (dev.db) Ä‘Ã£ Ä‘Æ°á»£c seed sáºµn qua `npm run db:seed`
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    let token = '';
    const email = `user_${Date.now()}@test.vn`;
    const baseEmail = 'student@onthi2029.vn';

    it('POST /api/auth/login vá»›i tÃ i khoáº£n seed', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: baseEmail, password: 'student123' })
        .expect(200);
      expect(res.body.access_token).toBeDefined();
      expect(res.body.user.role).toBe('student');
      token = res.body.access_token;
    });

    it('POST /api/auth/register táº¡o user má»›i', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email, password: 'test123456', full_name: 'Test User' })
        .expect(201);
      expect(res.body.user.email).toBe(email);
    });

    it('POST /api/auth/register trÃ¹ng email â†’ 409', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email, password: 'test123456', full_name: 'Dup' })
        .expect(409);
    });

    it('POST /api/auth/login sai máº­t kháº©u â†’ 401', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: baseEmail, password: 'wrong' })
        .expect(401);
    });

    it('GET /api/users/me cáº§n token', async () => {
      await request(app.getHttpServer()).get('/api/users/me').expect(401);
      const res = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.email).toBe(baseEmail);
    });
  });

  describe('Question + Exam + Submission flow', () => {
    let teacherToken = '';
    let studentToken = '';
    let subjectId = '';
    let chapterId = '';
    let questionId = '';
    let examId = '';
    let submissionId = '';

    beforeAll(async () => {
      const login = async (email: string, password: string) => {
        const res = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email, password });
        return res.body as AuthRes;
      };
      teacherToken = (await login('teacher@onthi2029.vn', 'teacher123'))
        .access_token;
      studentToken = (await login('student@onthi2029.vn', 'student123'))
        .access_token;
    });

    it('GET /api/subjects', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/subjects')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(res.body.length).toBeGreaterThan(0);
      const toan = res.body.find((s: { code: string }) => s.code === 'toan');
      expect(toan).toBeDefined();
      subjectId = toan.id;
    });

    it('GET /api/subjects/:id/chapters', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/subjects/${subjectId}/chapters`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(res.body.length).toBeGreaterThan(0);
      chapterId = res.body[0].id;
    });

    it('POST /api/questions (teacher) táº¡o cÃ¢u há»i', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          chapter_id: chapterId,
          content: 'Test: $1 + 1 = ?$',
          type: 'single_choice',
          difficulty: 'nhan_biet',
          status: 'published',
          explanation: 'Káº¿t quáº£ lÃ  2',
          options: [
            { content: '1', is_correct: false },
            { content: '2', is_correct: true },
            { content: '3', is_correct: false },
            { content: '4', is_correct: false },
          ],
        })
        .expect(201);
      expect(res.body.options).toHaveLength(4);
      expect(res.body.id).toBeDefined();
      questionId = res.body.id;
    });

    it('POST /api/questions (student) â†’ 403', async () => {
      await request(app.getHttpServer())
        .post('/api/questions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          chapter_id: chapterId,
          content: 'no',
          options: [{ content: 'x', is_correct: true }],
        })
        .expect(403);
    });

    it('GET /api/questions?difficulty=nhan_biet', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/questions?difficulty=nhan_biet&subject=${subjectId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(res.body.items.length).toBeGreaterThan(0);
    });

    it('PATCH /api/questions/:id (teacher)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/questions/${questionId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ content: 'Test cáº­p nháº­t: $2 + 2 = ?$' })
        .expect(200);
      expect(res.body.content).toContain('cáº­p nháº­t');
    });

    it('POST /api/exams/generate theo ma tráº­n', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/exams/generate')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Äá» thi thá»­ e2e',
          subject_id: subjectId,
          duration_minutes: 50,
          matrix: { nhan_biet: 1, thong_hieu: 1, van_dung: 0, van_dung_cao: 0 },
        })
        .expect(201);
      expect(res.body.examQuestions.length).toBe(2);
      examId = res.body.id;
    });

    it('GET /api/exams/:id khÃ´ng lá»™ Ä‘Ã¡p Ã¡n Ä‘Ãºng', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/exams/${examId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      for (const eq of res.body.examQuestions) {
        for (const opt of eq.question.options) {
          expect(opt.is_correct).toBeUndefined();
        }
      }
    });

    it('POST /api/submissions/exams/:id/start', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/submissions/exams/${examId}/start`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);
      expect(res.body.status).toBe('in_progress');
      submissionId = res.body.id;
    });

    it('POST /api/submissions/:id/save (auto-save)', async () => {
      const examRes = await request(app.getHttpServer())
        .get(`/api/exams/${examId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      const firstQ = examRes.body.examQuestions[0].question;
      const answers: Record<string, unknown> = {
        [firstQ.id]: [{ answer: firstQ.options[0].id }],
      };
      await request(app.getHttpServer())
        .post(`/api/submissions/${submissionId}/save`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers })
        .expect(201);
    });

    it('POST /api/submissions/:id/submit â†’ cháº¥m Ä‘iá»ƒm', async () => {
      const examRes = await request(app.getHttpServer())
        .get(`/api/exams/${examId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      const answers: Record<string, unknown> = {};
      for (const eq of examRes.body.examQuestions) {
        answers[eq.question.id] = [{ answer: eq.question.options[0].id }];
      }
      const res = await request(app.getHttpServer())
        .post(`/api/submissions/${submissionId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers })
        .expect(201);
      expect(res.body.status).toBe('submitted');
      expect(res.body.total_score).toBeGreaterThanOrEqual(0);
      expect(res.body.total_score).toBeLessThanOrEqual(10);
    });

    it('GET /api/submissions/:id/review', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/submissions/${submissionId}/review`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(res.body.questions.length).toBe(2);
    });

    it('POST submit bÃ i Ä‘Ã£ ná»™p â†’ khÃ´ng thá»ƒ sá»­a', async () => {
      await request(app.getHttpServer())
        .post(`/api/submissions/${submissionId}/save`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers: {} })
        .expect(400);
    });

    it('GET /api/submissions (mine) tráº£ danh sÃ¡ch', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/submissions')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Stats + Gamification', () => {
    let studentToken = '';
    let freshStudentToken = '';
    let subjectId = '';
    let chapterId = '';
    let examId = '';
    let submissionId = '';

    beforeAll(async () => {
      const login = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'student@onthi2029.vn', password: 'student123' });
      studentToken = (login.body as AuthRes).access_token;

      const subjects = await request(app.getHttpServer())
        .get('/api/subjects')
        .set('Authorization', `Bearer ${studentToken}`);
      subjectId = subjects.body.find(
        (s: { code: string }) => s.code === 'toan',
      ).id;
      const chapters = await request(app.getHttpServer())
        .get(`/api/subjects/${subjectId}/chapters`)
        .set('Authorization', `Bearer ${studentToken}`);
      chapterId = chapters.body[0].id;
    });

    it('GET /api/stats/me/overview', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/stats/me/overview')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(res.body.xp).toBeDefined();
      expect(res.body.level).toBeGreaterThanOrEqual(1);
      expect(res.body.total_submissions).toBeGreaterThan(0);
    });

    it('GET /api/stats/me/progress 30 ngÃ y', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/stats/me/progress?days=30')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(res.body.length).toBe(30);
    });

    it('GET /api/stats/me/badges tráº£ earned + locked', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/stats/me/badges')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(Array.isArray(res.body.earned)).toBe(true);
      expect(Array.isArray(res.body.locked)).toBe(true);
      expect(res.body.locked.length + res.body.earned.length).toBeGreaterThan(
        0,
      );
    });

    it('GET /api/stats/leaderboard', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/stats/leaderboard')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].rank).toBe(1);
      expect(res.body[0].full_name).toBeDefined();
    });

    it('Submit bÃ i â†’ tráº£ xp_earned vÃ  má»Ÿ huy hiá»‡u', async () => {
      const teacherLogin = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'teacher@onthi2029.vn', password: 'teacher123' });
      const teacherToken = (teacherLogin.body as AuthRes).access_token;

      const freshEmail = `fresh_${Date.now()}@test.vn`;
      const reg = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: freshEmail,
          password: 'test123456',
          full_name: 'Fresh Student',
        })
        .expect(201);
      const studentToken = (reg.body as AuthRes).access_token;
      freshStudentToken = studentToken;

      const q = await request(app.getHttpServer())
        .post('/api/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          chapter_id: chapterId,
          content: 'Gamification: $2 + 2 = ?$',
          type: 'single_choice',
          difficulty: 'nhan_biet',
          status: 'published',
          options: [
            { content: '3', is_correct: false },
            { content: '4', is_correct: true },
            { content: '5', is_correct: false },
            { content: '6', is_correct: false },
          ],
        })
        .expect(201);
      const correctOptionId = q.body.options.find(
        (o: { is_correct: boolean }) => o.is_correct,
      ).id;

      const exam = await request(app.getHttpServer())
        .post('/api/exams')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Äá» thi gamification e2e',
          subject_id: subjectId,
          duration_minutes: 10,
          questions: [{ question_id: q.body.id }],
        })
        .expect(201);
      examId = exam.body.id;

      const started = await request(app.getHttpServer())
        .post(`/api/submissions/exams/${examId}/start`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);
      submissionId = started.body.id;

      const res = await request(app.getHttpServer())
        .post(`/api/submissions/${submissionId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers: { [q.body.id]: [{ answer: correctOptionId }] } })
        .expect(201);
      expect(res.body.status).toBe('submitted');
      expect(res.body.total_score).toBe(10);
      expect(res.body.xp_earned).toBeGreaterThan(0);
      expect(Array.isArray(res.body.earned_badges)).toBe(true);

      const freshBadge = res.body.earned_badges.find(
        (b: { name: string }) => b.name === 'Khá»Ÿi Ä‘áº§u',
      );
      expect(freshBadge).toBeDefined();
    });

    it('Submission ná»™p xong ghi xp_awarded', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/submissions')
        .set('Authorization', `Bearer ${freshStudentToken}`)
        .expect(200);
      const fresh = res.body.find((s: { id: string }) => s.id === submissionId);
      expect(fresh).toBeDefined();
      expect(fresh.xp_awarded).toBeGreaterThan(0);
    });
  });

  describe('Admin', () => {
    let adminToken = '';
    let teacherToken = '';
    let studentToken = '';
    let targetUserId = '';
    let testChapterId = '';

    beforeAll(async () => {
      const login = async (email: string, password: string) => {
        const res = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email, password });
        return res.body as AuthRes;
      };
      adminToken = (await login('admin@onthi2029.vn', 'admin123')).access_token;
      teacherToken = (await login('teacher@onthi2029.vn', 'teacher123'))
        .access_token;
      studentToken = (await login('student@onthi2029.vn', 'student123'))
        .access_token;

      const subjects = await request(app.getHttpServer())
        .get('/api/subjects')
        .set('Authorization', `Bearer ${teacherToken}`);
      const toan = subjects.body.find(
        (s: { code: string }) => s.code === 'toan',
      );
      const chapters = await request(app.getHttpServer())
        .get(`/api/subjects/${toan.id}/chapters`)
        .set('Authorization', `Bearer ${teacherToken}`);
      testChapterId = chapters.body[0].id;
    });

    it('GET /api/admin/overview chá»‰ admin', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/overview')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
      const res = await request(app.getHttpServer())
        .get('/api/admin/overview')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body.counts.users).toBeGreaterThan(0);
      expect(res.body.counts.questions).toBeGreaterThan(0);
    });

    it('GET /api/admin/users', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/users?search=student%40onthi2029.vn&pageSize=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      targetUserId = res.body.items.find(
        (u: { email: string }) => u.email === 'student@onthi2029.vn',
      ).id;
      expect(targetUserId).toBeDefined();
    });

    it('PATCH khÃ³a user â†’ user khÃ´ng login Ä‘Æ°á»£c', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/admin/users/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_active: false })
        .expect(200);
      expect(res.body.is_active).toBe(false);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'student@onthi2029.vn', password: 'student123' })
        .expect(401);

      await request(app.getHttpServer())
        .patch(`/api/admin/users/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_active: true })
        .expect(200);
    });

    it('Admin duyá»‡t cÃ¢u há»i draft â†’ published', async () => {
      const q = await request(app.getHttpServer())
        .post('/api/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          chapter_id: testChapterId,
          content: 'CÃ¢u há»i chá» duyá»‡t: $1 + 1 = ?$',
          type: 'single_choice',
          difficulty: 'nhan_biet',
          status: 'draft',
          options: [
            { content: '2', is_correct: true },
            { content: '3', is_correct: false },
          ],
        })
        .expect(201);
      expect(q.body.status).toBe('draft');

      const res = await request(app.getHttpServer())
        .patch(`/api/admin/questions/${q.body.id}/moderate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'published' })
        .expect(200);
      expect(res.body.status).toBe('published');
    });

    it('PATCH tá»« chá»‘i cÃ¢u há»i draft â†’ rejected', async () => {
      const q = await request(app.getHttpServer())
        .post('/api/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          chapter_id: testChapterId,
          content: 'CÃ¢u há»i bá»‹ tá»« chá»‘i: $2 + 2 = ?$',
          type: 'single_choice',
          difficulty: 'nhan_biet',
          status: 'draft',
          options: [{ content: '4', is_correct: true }],
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/api/admin/questions/${q.body.id}/moderate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'rejected', reason: 'TrÃ¹ng láº·p cÃ¢u há»i' })
        .expect(200);
      expect(res.body.status).toBe('rejected');
    });
  });

  describe('CÃ¢u há»i ÄÃºng/Sai 2025', () => {
    let teacherToken = '';
    let studentToken = '';
    let subjectId = '';
    let chapterId = '';
    let questionId = '';
    let examId = '';
    let submissionId = '';

    beforeAll(async () => {
      const login = async (email: string, password: string) => {
        const res = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email, password });
        return res.body as AuthRes;
      };
      teacherToken = (await login('teacher@onthi2029.vn', 'teacher123'))
        .access_token;
      studentToken = (await login('student@onthi2029.vn', 'student123'))
        .access_token;

      const subjects = await request(app.getHttpServer())
        .get('/api/subjects')
        .set('Authorization', `Bearer ${teacherToken}`);
      subjectId = subjects.body.find(
        (s: { code: string }) => s.code === 'toan',
      ).id;
      const chapters = await request(app.getHttpServer())
        .get(`/api/subjects/${subjectId}/chapters`)
        .set('Authorization', `Bearer ${teacherToken}`);
      chapterId = chapters.body.find(
        (c: { order_index: number }) => c.order_index === 2,
      ).id;
    });

    it('Táº¡o cÃ¢u Ä/S 4 Ã½', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          chapter_id: chapterId,
          content: 'E2E ÄÃºng/Sai: $2+2=4$. Chá»n Ä‘Ãºng/sai tá»«ng Ã½.',
          type: 'multi_true_false',
          difficulty: 'van_dung',
          status: 'published',
          explanation: '2+2=4 Ä‘Ãºng',
          options: [
            { content: 'PhÃ¡t biá»ƒu a', is_correct: true },
            { content: 'PhÃ¡t biá»ƒu b', is_correct: true },
            { content: 'PhÃ¡t biá»ƒu c', is_correct: false },
            { content: 'PhÃ¡t biá»ƒu d', is_correct: false },
          ],
        })
        .expect(201);
      expect(res.body.type).toBe('multi_true_false');
      expect(res.body.options).toHaveLength(4);
      questionId = res.body.id;
    });

    const makeExam = async () => {
      const exam = await request(app.getHttpServer())
        .post('/api/exams')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Äá» Ä/S e2e',
          subject_id: subjectId,
          duration_minutes: 5,
          questions: [{ question_id: questionId }],
        })
        .expect(201);
      examId = exam.body.id;
      const started = await request(app.getHttpServer())
        .post(`/api/submissions/exams/${examId}/start`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);
      submissionId = started.body.id;
    };

    it('ÄÃ¡p Ã¡n Ä‘Ãºng 4/4 â†’ 1.0 Ä‘iá»ƒm cÃ¢u + Ä‘iá»ƒm tá»•ng 10', async () => {
      await makeExam();
      const res = await request(app.getHttpServer())
        .post(`/api/submissions/${submissionId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          answers: { [questionId]: [{ answer: 'true|true|false|false' }] },
        })
        .expect(201);
      expect(res.body.total_score).toBe(10);

      const review = await request(app.getHttpServer())
        .get(`/api/submissions/${submissionId}/review`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(review.body.questions[0].is_correct).toBe(true);
      expect(review.body.questions[0].earned_score).toBe(1);
    });

    it('ÄÃºng 3/4 â†’ 0.5 Ä‘iá»ƒm cÃ¢u', async () => {
      await makeExam();
      await request(app.getHttpServer())
        .post(`/api/submissions/${submissionId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          answers: { [questionId]: [{ answer: 'true|true|true|false' }] },
        })
        .expect(201);
      const review = await request(app.getHttpServer())
        .get(`/api/submissions/${submissionId}/review`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(review.body.questions[0].earned_score).toBe(0.5);
      expect(review.body.questions[0].is_correct).toBe(false);
    });

    it('ÄÃºng 2/4 â†’ 0.25, Ä‘Ãºng 1/4 â†’ 0', async () => {
      await makeExam();
      await request(app.getHttpServer())
        .post(`/api/submissions/${submissionId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          answers: { [questionId]: [{ answer: 'true|false|true|false' }] },
        })
        .expect(201);
      const review = await request(app.getHttpServer())
        .get(`/api/submissions/${submissionId}/review`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(review.body.questions[0].earned_score).toBe(0.25);

      await makeExam();
      await request(app.getHttpServer())
        .post(`/api/submissions/${submissionId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          answers: { [questionId]: [{ answer: 'true|false|true|true' }] },
        })
        .expect(201);
      const review2 = await request(app.getHttpServer())
        .get(`/api/submissions/${submissionId}/review`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(review2.body.questions[0].earned_score).toBe(0);
    });
  });

  describe('Forum há»i Ä‘Ã¡p', () => {
    let studentToken = '';
    let teacherToken = '';
    let subjectId = '';
    let postId = '';
    let commentId = '';
    let teacherPostId = '';

    beforeAll(async () => {
      const login = async (email: string, password: string) => {
        const res = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email, password });
        return res.body as AuthRes;
      };
      studentToken = (await login('student@onthi2029.vn', 'student123'))
        .access_token;
      teacherToken = (await login('teacher@onthi2029.vn', 'teacher123'))
        .access_token;

      const subjects = await request(app.getHttpServer())
        .get('/api/subjects')
        .set('Authorization', `Bearer ${studentToken}`);
      subjectId = subjects.body.find(
        (s: { code: string }) => s.code === 'toan',
      ).id;
    });

    it('Táº¡o bÃ i viáº¿t', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/forum/posts')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'CÃ¡ch giáº£i báº¥t phÆ°Æ¡ng trÃ¬nh logarit?',
          content: 'Em chÆ°a hiá»ƒu bÆ°á»›c Ä‘á»•i cÆ¡ sá»‘, ai giÃºp em vá»›i áº¡.',
          subject_id: subjectId,
        })
        .expect(201);
      expect(res.body.title).toContain('logarit');
      expect(res.body.comment_count).toBe(0);
      postId = res.body.id;
    });

    it('Liá»‡t kÃª bÃ i viáº¿t', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/forum/posts')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(res.body.total).toBeGreaterThanOrEqual(1);
      expect(res.body.items[0]).toHaveProperty('voted');
    });

    it('TÄƒng view khi xem chi tiáº¿t', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/forum/posts/${postId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(res.body.view_count).toBe(1);
      expect(res.body.comments).toHaveLength(0);
    });

    it('Upvote / bá» upvote', async () => {
      const v1 = await request(app.getHttpServer())
        .post(`/api/forum/posts/${postId}/vote`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);
      expect(v1.body.voted).toBe(true);

      const detail = await request(app.getHttpServer())
        .get(`/api/forum/posts/${postId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(detail.body.vote_count).toBe(1);
      expect(detail.body.voted).toBe(true);

      const v2 = await request(app.getHttpServer())
        .post(`/api/forum/posts/${postId}/vote`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);
      expect(v2.body.voted).toBe(false);
    });

    it('Tráº£ lá»i + thÃ´ng bÃ¡o tÃ¡c giáº£', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/forum/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ content: 'Äá»•i cÆ¡ sá»‘ log vá» 10 rá»“i giáº£i bÃ¬nh thÆ°á»ng em nhÃ©.' })
        .expect(201);
      expect(res.body.content).toContain('Äá»•i cÆ¡ sá»‘');
      commentId = res.body.id;

      const detail = await request(app.getHttpServer())
        .get(`/api/forum/posts/${postId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(detail.body.comment_count).toBe(1);

      const notis = await request(app.getHttpServer())
        .get('/api/users/me/notifications')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(notis.body.unread).toBeGreaterThanOrEqual(1);
    });

    it('Cháº¥m cÃ¢u tráº£ lá»i hay nháº¥t (chá»‰ tÃ¡c giáº£)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/forum/posts/${postId}/best/${commentId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);

      const res = await request(app.getHttpServer())
        .patch(`/api/forum/posts/${postId}/best/${commentId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(res.body.is_resolved).toBe(true);

      const detail = await request(app.getHttpServer())
        .get(`/api/forum/posts/${postId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(detail.body.comments[0].is_best).toBe(true);
      expect(detail.body.best_comment_id).toBe(commentId);
    });

    it('XÃ³a bÃ¬nh luáº­n: ngÆ°á»i ngoÃ i bá»‹ cáº¥m, tÃ¡c giáº£ Ä‘Æ°á»£c phÃ©p', async () => {
      const reg = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: `forumguest${Date.now()}@onthi2029.vn`,
          password: 'guest123',
          full_name: 'KhÃ¡ch Forum',
        })
        .expect(201);
      const guestToken = (reg.body as AuthRes).access_token;

      await request(app.getHttpServer())
        .delete(`/api/forum/posts/${postId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .delete(`/api/forum/posts/${postId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
    });

    it('Mark Ä‘Ã£ Ä‘á»c thÃ´ng bÃ¡o', async () => {
      const notis = await request(app.getHttpServer())
        .get('/api/users/me/notifications')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);
      const first = notis.body.items[0];
      await request(app.getHttpServer())
        .patch(`/api/users/me/notifications/${first.id}/read`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);
      const after = await request(app.getHttpServer())
        .get('/api/users/me/notifications')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);
      expect(after.body.unread).toBeLessThan(notis.body.unread);
    });

    it('XÃ³a bÃ i viáº¿t cá»§a ngÆ°á»i khÃ¡c bá»‹ cáº¥m, tÃ¡c giáº£ Ä‘Æ°á»£c phÃ©p', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/forum/posts')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ title: 'BÃ i viáº¿t Ä‘á»ƒ xÃ³a', content: 'test' });
      teacherPostId = created.body.id;

      await request(app.getHttpServer())
        .delete(`/api/forum/posts/${teacherPostId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .delete(`/api/forum/posts/${teacherPostId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/forum/posts/${teacherPostId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });
  });

  describe('Há»c táº­p: sá»• tay, Ä‘Ã¡nh dáº¥u cÃ¢u, há»“ sÆ¡ cÃ´ng khai', () => {
    let studentToken = '';
    let teacherToken = '';
    let studentId = '';
    let noteId = '';

    beforeAll(async () => {
      const login = async (email: string, password: string) => {
        const res = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email, password });
        return res.body as AuthRes;
      };
      studentToken = (await login('student@onthi2029.vn', 'student123'))
        .access_token;
      teacherToken = (await login('teacher@onthi2029.vn', 'teacher123'))
        .access_token;

      const me = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      studentId = me.body.id;
    });

    it('Sá»• tay: táº¡o/liá»‡t kÃª/sá»­a/xÃ³a ghi chÃº', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/notes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'CÃ´ng thá»©c log', content: '$\\log_a b = \\frac{\\ln b}{\\ln a}$' })
        .expect(201);
      expect(created.body.title).toBe('CÃ´ng thá»©c log');
      noteId = created.body.id;

      const list = await request(app.getHttpServer())
        .get('/api/notes')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(list.body.length).toBeGreaterThanOrEqual(1);

      await request(app.getHttpServer())
        .patch(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'CÃ´ng thá»©c log nÃ¢ng cao', content: 'ná»™i dung má»›i' })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ title: 'x', content: 'y' })
        .expect(403);

      await request(app.getHttpServer())
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
    });

    it('ÄÃ¡nh dáº¥u cÃ¢u nghi váº¥n khi lÃ m bÃ i rá»“i ná»™p', async () => {
      const subjects = await request(app.getHttpServer())
        .get('/api/subjects')
        .set('Authorization', `Bearer ${studentToken}`);
      const subjectId = subjects.body.find(
        (s: { code: string }) => s.code === 'toan',
      ).id;

      const questions = await request(app.getHttpServer())
        .get(`/api/questions?subject=${subjectId}&status=published&pageSize=3`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);
      const q1 = questions.body.items[0];
      const q2 = questions.body.items[1];

      const exam = await request(app.getHttpServer())
        .post('/api/exams')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Äá» test Ä‘Ã¡nh dáº¥u',
          subject_id: subjectId,
          duration_minutes: 5,
          questions: [
            { question_id: q1.id },
            { question_id: q2.id },
          ],
        })
        .expect(201);

      const sub = await request(app.getHttpServer())
        .post(`/api/submissions/exams/${exam.body.id}/start`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/submissions/${sub.body.id}/save`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ flagged: [q1.id] })
        .expect(201);

      const detail = await request(app.getHttpServer())
        .get(`/api/submissions/${sub.body.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(detail.body.flagged).toEqual([q1.id]);
    });

    it('Há»“ sÆ¡ cÃ´ng khai cá»§a há»c viÃªn', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/users/${studentId}/profile`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);
      expect(res.body.user.id).toBe(studentId);
      expect(res.body.stats.submissions).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(res.body.badges)).toBe(true);
      expect(Array.isArray(res.body.recentSubmissions)).toBe(true);
    });
  });
});
