import { PrismaClient, Difficulty } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

  const mathChapters = await prisma.chapter.findMany({
    where: { subject: { code: 'toan' } },
    orderBy: { order_index: 'asc' },
  });

  const sampleQuestions: {
    chapterIdx: number;
    content: string;
    difficulty: Difficulty;
    explanation: string;
    type: 'single_choice' | 'short_answer' | 'multi_true_false';
    options?: { content: string; is_correct: boolean }[];
    answerText?: string;
  }[] = [
    {
      chapterIdx: 0,
      content: 'Cho hàm số $f(x) = x^3 - 3x + 1$. Số điểm cực trị của hàm số là?',
      difficulty: 'thong_hieu',
      explanation:
        'Đạo hàm $f\'(x) = 3x^2 - 3 = 0 \\Rightarrow x = \\pm 1$. Đổi dấu tại 2 nghiệm nên có 2 điểm cực trị.',
      type: 'single_choice',
      options: [
        { content: '0', is_correct: false },
        { content: '1', is_correct: false },
        { content: '2', is_correct: true },
        { content: '3', is_correct: false },
      ],
    },
    {
      chapterIdx: 0,
      content:
        'Tiệm cận ngang của đồ thị hàm số $y = \\dfrac{2x+1}{x-1}$ là đường thẳng nào?',
      difficulty: 'nhan_biet',
      explanation:
        'Khi $x \\to \\infty$, $y \\to 2$ nên tiệm cận ngang là $y = 2$.',
      type: 'single_choice',
      options: [
        { content: '$y = 1$', is_correct: false },
        { content: '$y = 2$', is_correct: true },
        { content: '$x = 1$', is_correct: false },
        { content: '$y = -2$', is_correct: false },
      ],
    },
    {
      chapterIdx: 0,
      content:
        'Tìm tất cả giá trị $m$ để hàm số $y = x^3 - 3x^2 + m$ có 2 điểm cực trị nằm về hai phía trục hoành.',
      difficulty: 'van_dung_cao',
      explanation:
        'Hai điểm cực trị $A(0;m)$ và $B(2;m-4)$. Nằm hai phía trục hoành khi $m(m-4) < 0 \\Rightarrow 0 < m < 4$.',
      type: 'short_answer',
      answerText: '0<m<4',
    },
    {
      chapterIdx: 1,
      content: 'Giá trị của $\\log_2 32$ là?',
      difficulty: 'nhan_biet',
      explanation: '$\\log_2 32 = \\log_2 2^5 = 5$.',
      type: 'single_choice',
      options: [
        { content: '3', is_correct: false },
        { content: '4', is_correct: false },
        { content: '5', is_correct: true },
        { content: '6', is_correct: false },
      ],
    },
    {
      chapterIdx: 1,
      content: 'Tập nghiệm của bất phương trình $2^x > 8$ là?',
      difficulty: 'thong_hieu',
      explanation: '$2^x > 2^3 \\Leftrightarrow x > 3$.',
      type: 'single_choice',
      options: [
        { content: '$x < 3$', is_correct: false },
        { content: '$x > 3$', is_correct: true },
        { content: '$x \\ge 3$', is_correct: false },
        { content: '$x < -3$', is_correct: false },
      ],
    },
    {
      chapterIdx: 1,
      content:
        'Cho $\\log_2 a = 3$ và $\\log_2 b = 4$. Tính $\\log_2(ab)$.',
      difficulty: 'van_dung',
      explanation: '$\\log_2(ab) = \\log_2 a + \\log_2 b = 3 + 4 = 7$.',
      type: 'short_answer',
      answerText: '7',
    },
    {
      chapterIdx: 2,
      content: 'Tìm nguyên hàm của hàm số $f(x) = 2x$.',
      difficulty: 'nhan_biet',
      explanation: '$\\int 2x\\,dx = x^2 + C$.',
      type: 'single_choice',
      options: [
        { content: '$x^2 + C$', is_correct: true },
        { content: '$x^2$', is_correct: false },
        { content: '$2x^2 + C$', is_correct: false },
        { content: '$x + C$', is_correct: false },
      ],
    },
    {
      chapterIdx: 2,
      content: 'Tính $\\int_0^1 (3x^2) dx$.',
      difficulty: 'thong_hieu',
      explanation: '$\\int_0^1 3x^2 dx = [x^3]_0^1 = 1$.',
      type: 'single_choice',
      options: [
        { content: '0', is_correct: false },
        { content: '1', is_correct: true },
        { content: '2', is_correct: false },
        { content: '3', is_correct: false },
      ],
    },
    {
      chapterIdx: 2,
      content:
        'Tính diện tích hình phẳng giới hạn bởi $y = x^2$ và trục hoành từ $x=0$ đến $x=2$.',
      difficulty: 'van_dung',
      explanation: '$S = \\int_0^2 x^2 dx = \\dfrac{8}{3}$.',
      type: 'short_answer',
      answerText: '8/3',
    },
    {
      chapterIdx: 3,
      content:
        'Hình chóp $S.ABC$ có đáy là tam giác đều cạnh $a$, $SA$ vuông góc đáy và $SA = a$. Thể tích khối chóp là?',
      difficulty: 'van_dung',
      explanation:
        '$V = \\dfrac{1}{3} \\cdot \\dfrac{a^2\\sqrt{3}}{4} \\cdot a = \\dfrac{a^3\\sqrt{3}}{12}$.',
      type: 'single_choice',
      options: [
        { content: '$\\dfrac{a^3\\sqrt{3}}{12}$', is_correct: true },
        { content: '$\\dfrac{a^3\\sqrt{3}}{4}$', is_correct: false },
        { content: '$\\dfrac{a^3}{4}$', is_correct: false },
        { content: '$\\dfrac{a^3\\sqrt{3}}{3}$', is_correct: false },
      ],
    },
    {
      chapterIdx: 3,
      content: 'Thể tích khối lập phương có cạnh bằng $2$ là?',
      difficulty: 'nhan_biet',
      explanation: '$V = 2^3 = 8$.',
      type: 'single_choice',
      options: [
        { content: '4', is_correct: false },
        { content: '6', is_correct: false },
        { content: '8', is_correct: true },
        { content: '16', is_correct: false },
      ],
    },
    {
      chapterIdx: 4,
      content: 'Vectơ pháp tuyến của mặt phẳng $2x - y + 3z - 5 = 0$ là?',
      difficulty: 'nhan_biet',
      explanation: 'Hệ số của $x, y, z$: $\\vec{n} = (2; -1; 3)$.',
      type: 'single_choice',
      options: [
        { content: '$(2; 1; 3)$', is_correct: false },
        { content: '$(2; -1; 3)$', is_correct: true },
        { content: '$(-2; 1; 3)$', is_correct: false },
        { content: '$(1; -1; 3)$', is_correct: false },
      ],
    },
    {
      chapterIdx: 4,
      content:
        'Mặt cầu tâm $I(1;2;3)$ bán kính $R=2$ có phương trình là?',
      difficulty: 'thong_hieu',
      explanation:
        '$(x-1)^2 + (y-2)^2 + (z-3)^2 = 4$.',
      type: 'single_choice',
      options: [
        { content: '$(x+1)^2 + (y+2)^2 + (z+3)^2 = 4$', is_correct: false },
        { content: '$(x-1)^2 + (y-2)^2 + (z-3)^2 = 4$', is_correct: true },
        { content: '$(x-1)^2 + (y-2)^2 + (z-3)^2 = 2$', is_correct: false },
        { content: '$(x-1)^2 + (y+2)^2 + (z-3)^2 = 4$', is_correct: false },
      ],
    },
    {
      chapterIdx: 2,
      content:
        'Cho hàm số $F(x) = x^3 + C$ là một nguyên hàm của $f(x) = 3x^2$. Xét tính đúng/sai của các phát biểu sau:',
      difficulty: 'van_dung',
      explanation:
        'a) Đúng vì $F\'(x) = 3x^2 = f(x)$. b) Sai vì với $C = 1$ vẫn là nguyên hàm. c) Đúng. d) Sai vì nguyên hàm sai khác hằng số.',
      type: 'multi_true_false',
      options: [
        { content: '$F(x)$ là nguyên hàm của $f(x)$ trên $\\mathbb{R}$', is_correct: true },
        { content: 'Nếu $C = 0$ thì $F(x)$ không còn là nguyên hàm của $f(x)$', is_correct: false },
        { content: 'Họ nguyên hàm của $f(x)$ có dạng $x^3 + C$', is_correct: true },
        { content: '$F(0) = 0$ với mọi giá trị của $C$', is_correct: false },
      ],
    },
    {
      chapterIdx: 2,
      content:
        'Cho tích phân $I = \\int_0^1 2x\\, dx$. Xét tính đúng/sai của các phát biểu sau:',
      difficulty: 'thong_hieu',
      explanation:
        'a) Đúng. b) Sai vì kết quả bằng 1. c) Đúng. d) Sai vì đổi thứ tự cận chỉ đổi dấu.',
      type: 'multi_true_false',
      options: [
        { content: 'Hàm số $2x$ liên tục trên $[0;1]$', is_correct: true },
        { content: 'Giá trị của $I$ bằng $0$', is_correct: false },
        { content: 'Giá trị của $I$ bằng $1$', is_correct: true },
        { content: '$\\int_1^0 2x\\, dx = I$', is_correct: false },
      ],
    },
  ];

  for (const q of sampleQuestions) {
    const chapter = mathChapters[q.chapterIdx];
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
      .map(([k, v]) => `${v}=${sampleQuestions.filter((q) => q.difficulty === k).length}`)
      .join(', ')}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
