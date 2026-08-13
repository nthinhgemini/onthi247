import { PrismaClient, Difficulty } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CONTENT_2029 } from './content-2029';

const prisma = new PrismaClient();

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  nhan_biet: 'Nhận biết',
  thong_hieu: 'Thông hiểu',
  van_dung: 'Vận dụng',
  van_dung_cao: 'Vận dụng cao',
};

async function main() {
  await prisma.$transaction([
    prisma.userBadge.deleteMany(),
    prisma.badge.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.forumComment.deleteMany(),
    prisma.forumPost.deleteMany(),
    prisma.submissionAnswer.deleteMany(),
    prisma.submission.deleteMany(),
    prisma.examQuestion.deleteMany(),
    prisma.exam.deleteMany(),
    prisma.questionOption.deleteMany(),
    prisma.question.deleteMany(),
    prisma.chapter.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@onthi2029.vn',
      password_hash: await bcrypt.hash('admin123', 10),
      full_name: 'Quản trị viên',
      role: 'admin',
    },
  });

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@onthi2029.vn',
      password_hash: await bcrypt.hash('teacher123', 10),
      full_name: 'Giáo viên Toán',
      role: 'teacher',
      school: 'THPT Chuyên',
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'student@onthi2029.vn',
      password_hash: await bcrypt.hash('student123', 10),
      full_name: 'Nguyễn Văn Học Sinh',
      role: 'student',
      school: 'THPT Thực Nghiệm',
      target_block: 'A00',
      xp: 320,
      streak_count: 3,
      last_activity_at: new Date(),
    },
  });

  const subjectData: { name: string; code: string; chapters: string[] }[] = [
    {
      name: 'Toán',
      code: 'toan',
      chapters: [
        'Hàm số',
        'Mũ và Logarit',
        'Nguyên hàm - Tích phân',
        'Hình học không gian',
        'Oxyz',
      ],
    },
    {
      name: 'Vật Lý',
      code: 'vatly',
      chapters: ['Dao động cơ', 'Sóng cơ', 'Điện xoay chiều', 'Lượng tử ánh sáng'],
    },
    {
      name: 'Tiếng Anh',
      code: 'anh',
      chapters: ['Phát âm', 'Từ vựng - Ngữ pháp', 'Đọc hiểu', 'Viết lại câu'],
    },
    {
      name: 'Hóa Học',
      code: 'hoa',
      chapters: ['Cấu tạo nguyên tử', 'Phi kim', 'Hóa hữu cơ', 'Este - Lipit'],
    },
  ];

  for (const subj of subjectData) {
    const subject = await prisma.subject.create({
      data: { name: subj.name, code: subj.code },
    });
    for (let i = 0; i < subj.chapters.length; i++) {
      await prisma.chapter.create({
        data: {
          subject_id: subject.id,
          name: subj.chapters[i],
          order_index: i,
        },
      });
    }
  }

  const subjects = await prisma.subject.findMany();
  const subjectByCode = new Map(subjects.map((s) => [s.code, s]));
  const chapters = await prisma.chapter.findMany({
    orderBy: [{ subject: { code: 'asc' } }, { order_index: 'asc' }],
  });
  const chapterByKey = new Map<string, (typeof chapters)[number]>();
  for (const c of chapters) {
    chapterByKey.set(`${c.subject_id}:${c.order_index}`, c);
  }

  for (const q of CONTENT_2029) {
    const subject = subjectByCode.get(q.subjectCode);
    if (!subject) continue;
    const chapter = chapterByKey.get(`${subject.id}:${q.chapterIdx}`);
    if (!chapter) continue;

    const options = q.options ?? [
      { content: q.answerText as string, is_correct: true },
    ];
    await prisma.question.create({
      data: {
        chapter_id: chapter.id,
        content: q.content,
        type: q.type,
        difficulty: q.difficulty,
        explanation: q.explanation,
        created_by: teacher.id,
        status: 'published',
        options: {
          create: options.map((o, i) => ({
            content: o.content,
            is_correct: o.is_correct,
            order_index: i,
          })),
        },
      },
    });
  }

  const badges: {
    name: string;
    description: string;
    icon: string;
    condition_type: string;
    condition_value: number;
  }[] = [
    { name: 'Khởi đầu', description: 'Nộp bài thi đầu tiên', icon: '🚀', condition_type: 'submissions', condition_value: 1 },
    { name: 'Điểm 10', description: 'Đạt điểm tuyệt đối một bài thi', icon: '🎯', condition_type: 'perfect', condition_value: 1 },
    { name: 'Sinh viên tận tụy', description: 'Hoàn thành 10 bài thi', icon: '💪', condition_type: 'submissions', condition_value: 10 },
    { name: 'Chăm chỉ', description: 'Hoàn thành 3 ngày liên tiếp', icon: '🔥', condition_type: 'streak', condition_value: 3 },
    { name: '100 điểm', description: 'Tích lũy 100 XP', icon: '⚡', condition_type: 'xp', condition_value: 100 },
    { name: '500 điểm', description: 'Tích lũy 500 XP', icon: '🏆', condition_type: 'xp', condition_value: 500 },
    { name: 'Thần đồng', description: 'Tích lũy 1000 XP', icon: '👑', condition_type: 'xp', condition_value: 1000 },
  ];

  await prisma.badge.createMany({
    data: badges.map((b) => ({
      name: b.name,
      description: b.description,
      icon_url: b.icon,
      condition_type: b.condition_type,
      condition_value: b.condition_value,
    })),
  });

  console.log(
    `Seed xong: ${subjectData.length} môn, admin=${admin.email}, teacher=${teacher.email}, student=${student.email}`,
  );
  console.log(
    `Ma trận khó đề xuất: ${Object.entries(DIFFICULTY_LABEL)
      .map(([k, v]) => `${v}=${CONTENT_2029.filter((q) => q.difficulty === k).length}`)
      .join(', ')}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());