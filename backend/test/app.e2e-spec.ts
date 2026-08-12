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

describe('OnThi247 e2e', () => {
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
    // Lưu ý: test chạy trên DB dev (dev.db) đã được seed sẵn qua `npm run db:seed`
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    let token = '';
    const email = `user_${Date.now()}@test.vn`;
    const baseEmail = 'student@onthi247.vn';

    it('POST /api/auth/login với tài khoản seed', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: baseEmail, password: 'student123' })
        .expect(200);
      expect(res.body.access_token).toBeDefined();
      expect(res.body.user.role).toBe('student');
      token = res.body.access_token;
    });

    it('POST /api/auth/register tạo user mới', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email, password: 'test123456', full_name: 'Test User' })
        .expect(201);
      expect(res.body.user.email).toBe(email);
    });

    it('POST /api/auth/register trùng email → 409', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email, password: 'test123456', full_name: 'Dup' })
        .expect(409);
    });

    it('POST /api/auth/login sai mật khẩu → 401', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: baseEmail, password: 'wrong' })
        .expect(401);
    });

    it('GET /api/users/me cần token', async () => {
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
      teacherToken = (await login('teacher@onthi247.vn', 'teacher123'))
        .access_token;
      studentToken = (await login('student@onthi247.vn', 'student123'))
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

    it('POST /api/questions (teacher) tạo câu hỏi', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          chapter_id: chapterId,
          content: 'Test: $1 + 1 = ?$',
          type: 'single_choice',
          difficulty: 'nhan_biet',
          status: 'published',
          explanation: 'Kết quả là 2',
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

    it('POST /api/questions (student) → 403', async () => {
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
        .send({ content: 'Test cập nhật: $2 + 2 = ?$' })
        .expect(200);
      expect(res.body.content).toContain('cập nhật');
    });

    it('POST /api/exams/generate theo ma trận', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/exams/generate')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Đề thi thử e2e',
          subject_id: subjectId,
          duration_minutes: 50,
          matrix: { nhan_biet: 1, thong_hieu: 1, van_dung: 0, van_dung_cao: 0 },
        })
        .expect(201);
      expect(res.body.examQuestions.length).toBe(2);
      examId = res.body.id;
    });

    it('GET /api/exams/:id không lộ đáp án đúng', async () => {
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

    it('POST /api/submissions/:id/submit → chấm điểm', async () => {
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

    it('POST submit bài đã nộp → không thể sửa', async () => {
      await request(app.getHttpServer())
        .post(`/api/submissions/${submissionId}/save`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers: {} })
        .expect(400);
    });

    it('GET /api/submissions (mine) trả danh sách', async () => {
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
        .send({ email: 'student@onthi247.vn', password: 'student123' });
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

    it('GET /api/stats/me/progress 30 ngày', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/stats/me/progress?days=30')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(res.body.length).toBe(30);
    });

    it('GET /api/stats/me/badges trả earned + locked', async () => {
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

    it('Submit bài → trả xp_earned và mở huy hiệu', async () => {
      const teacherLogin = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'teacher@onthi247.vn', password: 'teacher123' });
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
          title: 'Đề thi gamification e2e',
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
        (b: { name: string }) => b.name === 'Khởi đầu',
      );
      expect(freshBadge).toBeDefined();
    });

    it('Submission nộp xong ghi xp_awarded', async () => {
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
      adminToken = (await login('admin@onthi247.vn', 'admin123')).access_token;
      teacherToken = (await login('teacher@onthi247.vn', 'teacher123'))
        .access_token;
      studentToken = (await login('student@onthi247.vn', 'student123'))
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

    it('GET /api/admin/overview chỉ admin', async () => {
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
        .get('/api/admin/users?search=student%40onthi247.vn&pageSize=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      targetUserId = res.body.items.find(
        (u: { email: string }) => u.email === 'student@onthi247.vn',
      ).id;
      expect(targetUserId).toBeDefined();
    });

    it('PATCH khóa user → user không login được', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/admin/users/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_active: false })
        .expect(200);
      expect(res.body.is_active).toBe(false);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'student@onthi247.vn', password: 'student123' })
        .expect(401);

      await request(app.getHttpServer())
        .patch(`/api/admin/users/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_active: true })
        .expect(200);
    });

    it('Admin duyệt câu hỏi draft → published', async () => {
      const q = await request(app.getHttpServer())
        .post('/api/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          chapter_id: testChapterId,
          content: 'Câu hỏi chờ duyệt: $1 + 1 = ?$',
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

    it('PATCH từ chối câu hỏi draft → rejected', async () => {
      const q = await request(app.getHttpServer())
        .post('/api/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          chapter_id: testChapterId,
          content: 'Câu hỏi bị từ chối: $2 + 2 = ?$',
          type: 'single_choice',
          difficulty: 'nhan_biet',
          status: 'draft',
          options: [{ content: '4', is_correct: true }],
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/api/admin/questions/${q.body.id}/moderate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'rejected', reason: 'Trùng lặp câu hỏi' })
        .expect(200);
      expect(res.body.status).toBe('rejected');
    });
  });

  describe('Câu hỏi Đúng/Sai 2025', () => {
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
      teacherToken = (await login('teacher@onthi247.vn', 'teacher123'))
        .access_token;
      studentToken = (await login('student@onthi247.vn', 'student123'))
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

    it('Tạo câu Đ/S 4 ý', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          chapter_id: chapterId,
          content: 'E2E Đúng/Sai: $2+2=4$. Chọn đúng/sai từng ý.',
          type: 'multi_true_false',
          difficulty: 'van_dung',
          status: 'published',
          explanation: '2+2=4 đúng',
          options: [
            { content: 'Phát biểu a', is_correct: true },
            { content: 'Phát biểu b', is_correct: true },
            { content: 'Phát biểu c', is_correct: false },
            { content: 'Phát biểu d', is_correct: false },
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
          title: 'Đề Đ/S e2e',
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

    it('Đáp án đúng 4/4 → 1.0 điểm câu + điểm tổng 10', async () => {
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

    it('Đúng 3/4 → 0.5 điểm câu', async () => {
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

    it('Đúng 2/4 → 0.25, đúng 1/4 → 0', async () => {
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

  describe('Forum hỏi đáp', () => {
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
      studentToken = (await login('student@onthi247.vn', 'student123'))
        .access_token;
      teacherToken = (await login('teacher@onthi247.vn', 'teacher123'))
        .access_token;

      const subjects = await request(app.getHttpServer())
        .get('/api/subjects')
        .set('Authorization', `Bearer ${studentToken}`);
      subjectId = subjects.body.find(
        (s: { code: string }) => s.code === 'toan',
      ).id;
    });

    it('Tạo bài viết', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/forum/posts')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Cách giải bất phương trình logarit?',
          content: 'Em chưa hiểu bước đổi cơ số, ai giúp em với ạ.',
          subject_id: subjectId,
        })
        .expect(201);
      expect(res.body.title).toContain('logarit');
      expect(res.body.comment_count).toBe(0);
      postId = res.body.id;
    });

    it('Liệt kê bài viết', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/forum/posts')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(res.body.total).toBeGreaterThanOrEqual(1);
      expect(res.body.items[0]).toHaveProperty('voted');
    });

    it('Tăng view khi xem chi tiết', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/forum/posts/${postId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(res.body.view_count).toBe(1);
      expect(res.body.comments).toHaveLength(0);
    });

    it('Upvote / bỏ upvote', async () => {
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

    it('Trả lời + thông báo tác giả', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/forum/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ content: 'Đổi cơ số log về 10 rồi giải bình thường em nhé.' })
        .expect(201);
      expect(res.body.content).toContain('Đổi cơ số');
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

    it('Chấm câu trả lời hay nhất (chỉ tác giả)', async () => {
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

    it('Xóa bình luận: người ngoài bị cấm, tác giả được phép', async () => {
      const reg = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: `forumguest${Date.now()}@onthi247.vn`,
          password: 'guest123',
          full_name: 'Khách Forum',
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

    it('Mark đã đọc thông báo', async () => {
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

    it('Xóa bài viết của người khác bị cấm, tác giả được phép', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/forum/posts')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ title: 'Bài viết để xóa', content: 'test' });
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

  describe('Học tập: sổ tay, đánh dấu câu, hồ sơ công khai', () => {
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
      studentToken = (await login('student@onthi247.vn', 'student123'))
        .access_token;
      teacherToken = (await login('teacher@onthi247.vn', 'teacher123'))
        .access_token;

      const me = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      studentId = me.body.id;
    });

    it('Sổ tay: tạo/liệt kê/sửa/xóa ghi chú', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/notes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Công thức log', content: '$\\log_a b = \\frac{\\ln b}{\\ln a}$' })
        .expect(201);
      expect(created.body.title).toBe('Công thức log');
      noteId = created.body.id;

      const list = await request(app.getHttpServer())
        .get('/api/notes')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(list.body.length).toBeGreaterThanOrEqual(1);

      await request(app.getHttpServer())
        .patch(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Công thức log nâng cao', content: 'nội dung mới' })
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

    it('Đánh dấu câu nghi vấn khi làm bài rồi nộp', async () => {
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
          title: 'Đề test đánh dấu',
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

    it('Hồ sơ công khai của học viên', async () => {
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
