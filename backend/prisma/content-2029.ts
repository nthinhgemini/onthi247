import { Difficulty, QuestionType } from '@prisma/client';

/**
 * Ngân hàng câu hỏi chuẩn Bộ GD-ĐT 2029 (Quyết định 764/QĐ-BGDĐT).
 * Mỗi câu gắn với subject code + chapter index (theo thứ tự seed subjects).
 */

export interface ContentQuestion {
  subjectCode: string;
  chapterIdx: number;
  type: QuestionType;
  difficulty: Difficulty;
  content: string;
  explanation: string;
  options?: { content: string; is_correct: boolean }[];
  answerText?: string;
}

export const CONTENT_2029: ContentQuestion[] = [
  // ============ TOÁN ============
  // ---- Phần I: trắc nghiệm (chương Hàm số) ----
  {
    subjectCode: 'toan',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content: 'Cho hàm số $y = x^3 - 3x + 2$. Số điểm cực trị của hàm số là?',
    explanation:
      'Ta có $y\' = 3x^2 - 3 = 3(x-1)(x+1)$. $y\'$ đổi dấu khi đi qua $x = \\pm 1$ nên hàm số có 2 điểm cực trị.',
    options: [
      { content: '1', is_correct: false },
      { content: '2', is_correct: true },
      { content: '3', is_correct: false },
      { content: '4', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content: 'Tiệm cận đứng của đồ thị hàm số $y = \\dfrac{2x+1}{x-3}$ là?',
    explanation:
      'Mẫu số bằng 0 khi $x = 3$ và tử khác 0, nên tiệm cận đứng là $x = 3$.',
    options: [
      { content: '$x = 2$', is_correct: false },
      { content: '$y = 2$', is_correct: false },
      { content: '$x = 3$', is_correct: true },
      { content: '$y = 3$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Cho hàm số $y = \\dfrac{x+1}{x-1}$. Đường tiệm cận ngang của đồ thị hàm số là?',
    explanation:
      'Khi $x \\to \\pm\\infty$ thì $y \\to 1$, vậy tiệm cận ngang $y = 1$.',
    options: [
      { content: '$y = 1$', is_correct: true },
      { content: '$y = -1$', is_correct: false },
      { content: '$x = 1$', is_correct: false },
      { content: '$y = 0$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Hàm số $y = x^3 - 3x^2 + 3x$ đồng biến trên khoảng nào?',
    explanation:
      '$y\' = 3x^2 - 6x + 3 = 3(x-1)^2 \\ge 0$ với mọi $x$, bằng 0 tại $x=1$. Hàm số đồng biến trên $\\mathbb{R}$.',
    options: [
      { content: '$(0; 2)$', is_correct: false },
      { content: '$(-\\infty; 1)$', is_correct: false },
      { content: '$(1; +\\infty)$', is_correct: false },
      { content: '$\\mathbb{R}$', is_correct: true },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Giá trị lớn nhất của hàm số $y = -x^2 + 4x - 1$ trên $[0; 3]$ là?',
    explanation:
      'Đỉnh parabol tại $x = 2$ (thuộc đoạn). $y(2) = -4 + 8 - 1 = 3$. $y(0) = -1$, $y(3) = -9+12-1=2$. Vậy GTLN là 3.',
    options: [
      { content: '$1$', is_correct: false },
      { content: '$2$', is_correct: false },
      { content: '$3$', is_correct: true },
      { content: '$4$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Số giá trị nguyên của $m$ để hàm số $y = x^3 - 3mx^2 + 3x$ đồng biến trên $\\mathbb{R}$ là?',
    explanation:
      '$y\' = 3x^2 - 6mx + 3$. Hàm số đồng biến khi $\\Delta\' = 9m^2 - 9 \\le 0 \\Leftrightarrow -1 \\le m \\le 1$. Có 3 giá trị nguyên: $-1, 0, 1$.',
    options: [
      { content: '1', is_correct: false },
      { content: '2', is_correct: false },
      { content: '3', is_correct: true },
      { content: '4', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Cho hàm số $y = \\dfrac{2x-3}{x+1}$. Số đường tiệm cận của đồ thị hàm số là?',
    explanation:
      'Tiệm cận đứng $x = -1$, tiệm cận ngang $y = 2$. Vậy có 2 đường tiệm cận.',
    options: [
      { content: '1', is_correct: false },
      { content: '2', is_correct: true },
      { content: '3', is_correct: false },
      { content: '4', is_correct: false },
    ],
  },
  // ---- Phần II: Đúng/Sai (chương Hàm số) ----
  {
    subjectCode: 'toan',
    chapterIdx: 0,
    type: 'multi_true_false',
    difficulty: 'thong_hieu',
    content:
      'Cho hàm số $y = x^3 - 3x$. Xét tính đúng/sai của các phát biểu sau:',
    explanation:
      'a) Đúng, $y\' = 3x^2 - 3$ đổi dấu tại $x=\\pm1$ nên hàm số có 2 điểm cực trị. b) Đúng, cực đại tại $x=-1$. c) Đúng, $y(0)=0$ là điểm uốn vì $y\'\' = 6x$ đổi dấu tại $x=0$. d) Sai, hàm số lẻ vì $y(-x) = -y(x)$.',
    options: [
      { content: 'Hàm số có đúng 2 điểm cực trị', is_correct: true },
      { content: 'Hàm số đạt cực đại tại $x = -1$', is_correct: true },
      { content: 'Đồ thị hàm số nhận gốc tọa độ làm điểm uốn', is_correct: true },
      { content: 'Hàm số là hàm chẵn', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 0,
    type: 'multi_true_false',
    difficulty: 'thong_hieu',
    content:
      'Cho hàm số $y = \\dfrac{x+1}{x-1}$. Xét tính đúng/sai của các phát biểu sau:',
    explanation:
      'a) Đúng, tiệm cận đứng $x = 1$. b) Đúng, tiệm cận ngang $y = 1$. c) Đúng, hàm số nghịch biến trên từng khoảng xác định vì $y\' = \\dfrac{-2}{(x-1)^2} < 0$. d) Sai, giao điểm với trục hoành là $x = -1$.',
    options: [
      { content: 'Đồ thị có tiệm cận đứng $x = 1$', is_correct: true },
      { content: 'Đồ thị có tiệm cận ngang $y = 1$', is_correct: true },
      { content: 'Hàm số nghịch biến trên tập xác định', is_correct: true },
      { content: 'Đồ thị cắt trục hoành tại điểm $x = 1$', is_correct: false },
    ],
  },
  // ---- Phần III: trả lời ngắn (chương Hàm số) ----
  {
    subjectCode: 'toan',
    chapterIdx: 0,
    type: 'short_answer',
    difficulty: 'van_dung',
    content:
      'Cho hàm số $y = x^3 - 3x^2 + m$ có đồ thị cắt trục hoành tại 3 điểm phân biệt. Tìm số giá trị nguyên của $m$ trong khoảng $(-10; 10)$.',
    explanation:
      'Hàm số đạt cực đại $y_{CD} = m$ tại $x=0$, cực tiểu $y_{CT} = m - 4$ tại $x=2$. Đồ thị cắt trục hoành tại 3 điểm khi $y_{CD} \\cdot y_{CT} < 0 \\Leftrightarrow m(m-4) < 0 \\Leftrightarrow 0 < m < 4$. Các giá trị nguyên: 1, 2, 3 → 3 giá trị.',
    answerText: '3',
  },
  {
    subjectCode: 'toan',
    chapterIdx: 0,
    type: 'short_answer',
    difficulty: 'van_dung',
    content:
      'Tìm giá trị của tham số $m$ để hàm số $y = \\dfrac{mx + 2}{x - m}$ đồng biến trên mỗi khoảng xác định. (Viết giá trị $m$ dưới dạng bất phương trình, ví dụ $m>2$ hoặc $m<3$.)',
    explanation:
      'Đạo hàm $y\' = \\dfrac{-m^2 - 2}{(x-m)^2}$. Vì $-m^2 - 2 < 0$ với mọi $m$, hàm số luôn nghịch biến, không có giá trị nào thỏa mãn.',
    answerText: 'khong co m',
  },
  // ---- Phần I: trắc nghiệm (chương Mũ và Logarit) ----
  {
    subjectCode: 'toan',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content: 'Giá trị của $\\log_3 81$ là?',
    explanation: '$81 = 3^4$ nên $\\log_3 81 = 4$.',
    options: [
      { content: '2', is_correct: false },
      { content: '3', is_correct: false },
      { content: '4', is_correct: true },
      { content: '9', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content: 'Tập xác định của hàm số $y = \\log_2(x - 3)$ là?',
    explanation: 'Điều kiện $x - 3 > 0 \\Leftrightarrow x > 3$.',
    options: [
      { content: '$(3; +\\infty)$', is_correct: true },
      { content: '$[3; +\\infty)$', is_correct: false },
      { content: '$\\mathbb{R}$', is_correct: false },
      { content: '$(0; +\\infty)$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content: 'Phương trình $2^{x+1} = 8$ có nghiệm là?',
    explanation:
      '$2^{x+1} = 2^3 \\Leftrightarrow x+1 = 3 \\Leftrightarrow x = 2$.',
    options: [
      { content: '$x = 2$', is_correct: true },
      { content: '$x = 3$', is_correct: false },
      { content: '$x = 1$', is_correct: false },
      { content: '$x = 4$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content: 'Cho $\\log_a b = 3$. Giá trị của $\\log_a(a^2 b)$ là?',
    explanation:
      '$\\log_a(a^2 b) = 2 + \\log_a b = 2 + 3 = 5$.',
    options: [
      { content: '3', is_correct: false },
      { content: '4', is_correct: false },
      { content: '5', is_correct: true },
      { content: '6', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Bất phương trình $\\log_{\\frac{1}{2}}(x-1) \\ge -1$ có tập nghiệm là?',
    explanation:
      'Điều kiện $x > 1$. Vì cơ số $\\dfrac12 < 1$, đổi chiều: $x - 1 \\le \\left(\\dfrac12\\right)^{-1} = 2 \\Rightarrow x \\le 3$. Vậy $1 < x \\le 3$.',
    options: [
      { content: '$(1; 3]$', is_correct: true },
      { content: '$[1; 3]$', is_correct: false },
      { content: '$(1; 3)$', is_correct: false },
      { content: '$(-\\infty; 3]$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'van_dung_cao',
    content:
      'Số nghiệm của phương trình $3^x + 3^{1-x} = 4$ là?',
    explanation:
      'Đặt $t = 3^x > 0$. Phương trình: $t + \\dfrac{3}{t} = 4 \\Leftrightarrow t^2 - 4t + 3 = 0 \\Leftrightarrow t = 1$ hoặc $t = 3$. Mỗi nghiệm $t>0$ cho một nghiệm $x$: $x = 0$ và $x = 1$. Vậy có 2 nghiệm.',
    options: [
      { content: '0', is_correct: false },
      { content: '1', is_correct: false },
      { content: '2', is_correct: true },
      { content: '3', is_correct: false },
    ],
  },
  // ---- Phần II: Đúng/Sai (chương Mũ và Logarit) ----
  {
    subjectCode: 'toan',
    chapterIdx: 1,
    type: 'multi_true_false',
    difficulty: 'thong_hieu',
    content:
      'Cho phương trình $4^x - 2^{x+1} - 8 = 0$. Xét tính đúng/sai của các phát biểu sau:',
    explanation:
      'a) Đúng, đặt $t = 2^x > 0$ ta được $t^2 - 2t - 8 = 0$. b) Đúng, $t = 4$ (loại $t=-2$). c) Đúng, $2^x = 4 \\Rightarrow x = 2$. d) Sai, tổng các nghiệm là 2, không phải 0.',
    options: [
      { content: 'Đặt $t = 2^x$, phương trình trở thành $t^2 - 2t - 8 = 0$', is_correct: true },
      { content: 'Phương trình theo $t$ có nghiệm dương duy nhất là $t = 4$', is_correct: true },
      { content: 'Phương trình ban đầu có nghiệm $x = 2$', is_correct: true },
      { content: 'Tổng các nghiệm của phương trình bằng 0', is_correct: false },
    ],
  },
  // ---- Phần III: trả lời ngắn (chương Mũ và Logarit) ----
  {
    subjectCode: 'toan',
    chapterIdx: 1,
    type: 'short_answer',
    difficulty: 'van_dung',
    content:
      'Số nghiệm nguyên của bất phương trình $\\log_2 x + \\log_2(x-3) \\le 2$ là? (Viết số, ví dụ: 2)',
    explanation:
      'Điều kiện $x > 3$. BPT: $\\log_2[x(x-3)] \\le 2 \\Leftrightarrow x^2 - 3x \\le 4 \\Leftrightarrow -1 \\le x \\le 4$. Kết hợp điều kiện: $3 < x \\le 4$. Vậy có 1 nghiệm nguyên là $x = 4$.',
    answerText: '1',
  },
  // ---- Phần I: trắc nghiệm (chương Nguyên hàm - Tích phân) ----
  {
    subjectCode: 'toan',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content: 'Nguyên hàm của hàm số $f(x) = \\dfrac{1}{x}$ (với $x > 0$) là?',
    explanation: '$\\int \\dfrac{1}{x}\\,dx = \\ln|x| + C = \\ln x + C$ (vì $x > 0$).',
    options: [
      { content: '$\\ln x + C$', is_correct: true },
      { content: '$\\dfrac{1}{x^2} + C$', is_correct: false },
      { content: '$x\\ln x + C$', is_correct: false },
      { content: '$e^x + C$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content: 'Tính $\\int_0^1 x^2\\,dx$.',
    explanation: '$\\int_0^1 x^2\\,dx = \\left.\\dfrac{x^3}{3}\\right|_0^1 = \\dfrac13$.',
    options: [
      { content: '$\\dfrac13$', is_correct: true },
      { content: '$1$', is_correct: false },
      { content: '$\\dfrac23$', is_correct: false },
      { content: '$2$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Tính $\\int_0^{\\pi} \\sin x\\,dx$.',
    explanation: '$\\int_0^{\\pi} \\sin x\\,dx = [-\\cos x]_0^{\\pi} = -\\cos\\pi + \\cos 0 = 2$.',
    options: [
      { content: '0', is_correct: false },
      { content: '1', is_correct: false },
      { content: '2', is_correct: true },
      { content: '$\\pi$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Tính tích phân $\\int_1^2 \\dfrac{1}{x}\\,dx$.',
    explanation: '$\\int_1^2 \\dfrac{1}{x}\\,dx = \\ln 2 - \\ln 1 = \\ln 2$.',
    options: [
      { content: '$\\ln 2$', is_correct: true },
      { content: '$\\ln 3$', is_correct: false },
      { content: '$1$', is_correct: false },
      { content: '$2\\ln 2$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Diện tích hình phẳng giới hạn bởi $y = x^2$ và $y = x$ là?',
    explanation:
      'Giao điểm: $x^2 = x \\Leftrightarrow x = 0$ hoặc $x = 1$. Diện tích $S = \\int_0^1 (x - x^2)\\,dx = \\left[\\dfrac{x^2}{2} - \\dfrac{x^3}{3}\\right]_0^1 = \\dfrac16$.',
    options: [
      { content: '$\\dfrac16$', is_correct: true },
      { content: '$\\dfrac13$', is_correct: false },
      { content: '$\\dfrac12$', is_correct: false },
      { content: '$\\dfrac{5}{6}$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Thể tích khối tròn xoay tạo bởi hình phẳng giới hạn bởi $y = \\sqrt{x}$, trục hoành, $x = 4$ quay quanh $Ox$ là?',
    explanation:
      '$V = \\pi\\int_0^4 (\\sqrt{x})^2\\,dx = \\pi\\int_0^4 x\\,dx = \\pi\\left.\\dfrac{x^2}{2}\\right|_0^4 = 8\\pi$.',
    options: [
      { content: '$4\\pi$', is_correct: false },
      { content: '$8\\pi$', is_correct: true },
      { content: '$16\\pi$', is_correct: false },
      { content: '$\\dfrac{16\\pi}{3}$', is_correct: false },
    ],
  },
  // ---- Phần II: Đúng/Sai (chương Nguyên hàm - Tích phân) ----
  {
    subjectCode: 'toan',
    chapterIdx: 2,
    type: 'multi_true_false',
    difficulty: 'van_dung',
    content:
      'Cho $I = \\int_0^2 (2x + 1)\\,dx$. Xét tính đúng/sai của các phát biểu sau:',
    explanation:
      'a) Đúng. b) Đúng, $I = [x^2 + x]_0^2 = 6$. c) Sai, $6$ không phải số vô tỉ. d) Đúng.',
    options: [
      { content: 'Hàm số $2x+1$ có nguyên hàm là $x^2 + x$', is_correct: true },
      { content: 'Giá trị của $I$ bằng $6$', is_correct: true },
      { content: 'Giá trị của $I$ là một số vô tỉ', is_correct: false },
      { content: '$I$ chính là diện tích hình thang giới hạn bởi $y = 2x + 1$, trục hoành và $x = 2$', is_correct: true },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 2,
    type: 'multi_true_false',
    difficulty: 'van_dung',
    content:
      'Cho hàm số $f(x)$ liên tục trên $[a; b]$. Xét tính đúng/sai của các phát biểu sau:',
    explanation:
      'a) Đúng, tính chất tuyến tính. b) Sai, $\\int_a^b f = -\\int_b^a f$. c) Đúng. d) Sai, không thể tách tích hai hàm.',
    options: [
      { content: '$\\int_a^b [f(x) + g(x)]\\,dx = \\int_a^b f(x)\\,dx + \\int_a^b g(x)\\,dx$', is_correct: true },
      { content: '$\\int_a^b f(x)\\,dx = \\int_b^a f(x)\\,dx$', is_correct: false },
      { content: '$\\int_a^c f(x)\\,dx + \\int_c^b f(x)\\,dx = \\int_a^b f(x)\\,dx$ với $a < c < b$', is_correct: true },
      { content: '$\\int_a^b f(x)g(x)\\,dx = \\int_a^b f(x)\\,dx \\cdot \\int_a^b g(x)\\,dx$', is_correct: false },
    ],
  },
  // ---- Phần III: trả lời ngắn (chương Nguyên hàm - Tích phân) ----
  {
    subjectCode: 'toan',
    chapterIdx: 2,
    type: 'short_answer',
    difficulty: 'van_dung',
    content:
      'Tính $\\int_0^{\\frac{\\pi}{2}} \\cos^2 x\\,dx$. (Kết quả dạng phân số tối giản $\\dfrac{a\\pi}{b}$, hãy nhập $a/b$.)',
    explanation:
      '$\\cos^2 x = \\dfrac{1 + \\cos 2x}{2}$. $\\int_0^{\\pi/2} \\cos^2 x\\,dx = \\left[\\dfrac{x}{2} + \\dfrac{\\sin 2x}{4}\\right]_0^{\\pi/2} = \\dfrac{\\pi}{4}$.',
    answerText: '1/4',
  },
  {
    subjectCode: 'toan',
    chapterIdx: 2,
    type: 'short_answer',
    difficulty: 'van_dung_cao',
    content:
      'Cho $F(x)$ là nguyên hàm của $f(x) = 3x^2 + 2x$ và $F(1) = 2$. Tính $F(0)$.',
    explanation:
      '$F(x) = x^3 + x^2 + C$. $F(1) = 2 \\Rightarrow 2 = 1 + 1 + C \\Rightarrow C = 0$. Vậy $F(0) = 0$.',
    answerText: '0',
  },
  // ---- Phần I: trắc nghiệm (chương Hình học không gian) ----
  {
    subjectCode: 'toan',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Thể tích khối lập phương cạnh $a$ là?',
    explanation: '$V = a^3$.',
    options: [
      { content: '$a^2$', is_correct: false },
      { content: '$a^3$', is_correct: true },
      { content: '$\\dfrac{a^3}{3}$', is_correct: false },
      { content: '$\\dfrac{a^3}{6}$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Thể tích khối chóp có diện tích đáy $S$ và chiều cao $h$ là?',
    explanation: '$V = \\dfrac{1}{3}Sh$.',
    options: [
      { content: '$\\dfrac{1}{3}Sh$', is_correct: true },
      { content: '$Sh$', is_correct: false },
      { content: '$\\dfrac{1}{2}Sh$', is_correct: false },
      { content: '$\\dfrac{1}{4}Sh$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Cho hình chóp $S.ABC$ có đáy $ABC$ là tam giác đều cạnh $a$, $SA \\perp (ABC)$ và $SA = a$. Thể tích khối chóp là?',
    explanation:
      '$V = \\dfrac13 \\cdot \\dfrac{a^2\\sqrt3}{4} \\cdot a = \\dfrac{a^3\\sqrt3}{12}$.',
    options: [
      { content: '$\\dfrac{a^3\\sqrt3}{12}$', is_correct: true },
      { content: '$\\dfrac{a^3\\sqrt3}{4}$', is_correct: false },
      { content: '$\\dfrac{a^3}{4}$', is_correct: false },
      { content: '$\\dfrac{a^3\\sqrt3}{3}$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Diện tích xung quanh của hình nón có bán kính đáy $r$ và đường sinh $l$ là?',
    explanation: '$S_{xq} = \\pi r l$.',
    options: [
      { content: '$2\\pi r l$', is_correct: false },
      { content: '$\\pi r l$', is_correct: true },
      { content: '$\\pi r^2$', is_correct: false },
      { content: '$\\pi r l + \\pi r^2$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Cho khối trụ có bán kính đáy $r = 2$ và chiều cao $h = 3$. Thể tích khối trụ là?',
    explanation: '$V = \\pi r^2 h = \\pi \\cdot 4 \\cdot 3 = 12\\pi$.',
    options: [
      { content: '$6\\pi$', is_correct: false },
      { content: '$12\\pi$', is_correct: true },
      { content: '$18\\pi$', is_correct: false },
      { content: '$24\\pi$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Cho tứ diện đều $ABCD$ cạnh $a$. Thể tích khối tứ diện là?',
    explanation:
      '$V = \\dfrac{a^3\\sqrt2}{12}$.',
    options: [
      { content: '$\\dfrac{a^3\\sqrt2}{12}$', is_correct: true },
      { content: '$\\dfrac{a^3\\sqrt2}{6}$', is_correct: false },
      { content: '$\\dfrac{a^3\\sqrt3}{12}$', is_correct: false },
      { content: '$\\dfrac{a^3}{12}$', is_correct: false },
    ],
  },
  // ---- Phần II: Đúng/Sai (chương Hình học không gian) ----
  {
    subjectCode: 'toan',
    chapterIdx: 3,
    type: 'multi_true_false',
    difficulty: 'van_dung',
    content:
      'Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $a$, $SA \\perp (ABCD)$ và $SA = a$. Xét tính đúng/sai:',
    explanation:
      'a) Đúng, vì $SA \\perp (ABCD)$ nên $SA \\perp BC$. b) Đúng, $BC \\perp (SAB)$ vì $BC \\perp AB$ và $BC \\perp SA$. c) Đúng, $V = \\dfrac13 a^2 \\cdot a = \\dfrac{a^3}{3}$. d) Sai, góc tạo bởi $SC$ và đáy là $\\angle SCA = 45°$, không phải $60°$.',
    options: [
      { content: '$SA \\perp BC$', is_correct: true },
      { content: '$BC \\perp (SAB)$', is_correct: true },
      { content: 'Thể tích khối chóp bằng $\\dfrac{a^3}{3}$', is_correct: true },
      { content: 'Góc giữa $SC$ và mặt phẳng đáy bằng $60°$', is_correct: false },
    ],
  },
  // ---- Phần III: trả lời ngắn (chương Hình học không gian) ----
  {
    subjectCode: 'toan',
    chapterIdx: 3,
    type: 'short_answer',
    difficulty: 'van_dung_cao',
    content:
      'Cho hình lập phương $ABCD.A\'B\'C\'D\'$ cạnh $a$. Tính góc giữa hai đường thẳng $AC\'$ và $BD$ (độ, làm tròn đến hàng đơn vị).',
    explanation:
      'Chọn hệ trục: $A(0,0,0)$, $B(a,0,0)$, $C(a,a,0)$, $D(0,a,0)$, $C\'(a,a,a)$. $\\overrightarrow{AC\'} = (a,a,a)$, $\\overrightarrow{BD} = (-a,a,0)$. $\\cos\\theta = \\dfrac{|(a,a,a)\\cdot(-a,a,0)|}{|AC\'||BD|} = \\dfrac{|0|}{\\sqrt{3}a \\cdot a\\sqrt2} = 0$. Vậy $\\theta = 90°$.',
    answerText: '90',
  },
  // ---- Phần I: trắc nghiệm (chương Oxyz) ----
  {
    subjectCode: 'toan',
    chapterIdx: 4,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Vectơ pháp tuyến của mặt phẳng $2x - y + 3z - 4 = 0$ là?',
    explanation: 'Hệ số của $x, y, z$ cho ta vectơ pháp tuyến $\\vec{n} = (2; -1; 3)$.',
    options: [
      { content: '$(2; 1; 3)$', is_correct: false },
      { content: '$(2; -1; 3)$', is_correct: true },
      { content: '$(-2; 1; 3)$', is_correct: false },
      { content: '$(1; -1; 3)$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 4,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Mặt cầu tâm $I(1; 2; -1)$ bán kính $R = 2$ có phương trình là?',
    explanation:
      '$(x-1)^2 + (y-2)^2 + (z+1)^2 = 4$.',
    options: [
      { content: '$(x-1)^2 + (y-2)^2 + (z-1)^2 = 4$', is_correct: false },
      { content: '$(x-1)^2 + (y-2)^2 + (z+1)^2 = 4$', is_correct: true },
      { content: '$(x+1)^2 + (y+2)^2 + (z-1)^2 = 4$', is_correct: false },
      { content: '$(x-1)^2 + (y-2)^2 + (z+1)^2 = 2$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 4,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Trong không gian $Oxyz$, cho $A(1; 2; 3)$ và $B(3; 2; 1)$. Độ dài đoạn $AB$ là?',
    explanation:
      '$AB = \\sqrt{(3-1)^2 + (2-2)^2 + (1-3)^2} = \\sqrt{4 + 0 + 4} = 2\\sqrt2$.',
    options: [
      { content: '$\\sqrt2$', is_correct: false },
      { content: '$2$', is_correct: false },
      { content: '$2\\sqrt2$', is_correct: true },
      { content: '$4$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 4,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Phương trình tham số của đường thẳng đi qua $A(1; 2; 3)$ có vectơ chỉ phương $\\vec{u} = (1; -1; 2)$ là?',
    explanation:
      '$\\begin{cases} x = 1 + t \\\\ y = 2 - t \\\\ z = 3 + 2t \\end{cases}$.',
    options: [
      { content: '$x = 1 + t, y = 2 - t, z = 3 + 2t$', is_correct: true },
      { content: '$x = 1 + t, y = 2 + t, z = 3 + 2t$', is_correct: false },
      { content: '$x = 1 - t, y = 2 + t, z = 3 - 2t$', is_correct: false },
      { content: '$x = 1 + t, y = 2 - t, z = 3 - 2t$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 4,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Khoảng cách từ điểm $M(1; 2; 3)$ đến mặt phẳng $(P): x - 2y + 2z - 1 = 0$ là?',
    explanation:
      '$d = \\dfrac{|1 - 4 + 6 - 1|}{\\sqrt{1 + 4 + 4}} = \\dfrac{2}{3}$.',
    options: [
      { content: '$\\dfrac23$', is_correct: true },
      { content: '$\\dfrac43$', is_correct: false },
      { content: '$2$', is_correct: false },
      { content: '$3$', is_correct: false },
    ],
  },
  {
    subjectCode: 'toan',
    chapterIdx: 4,
    type: 'single_choice',
    difficulty: 'van_dung_cao',
    content:
      'Mặt phẳng đi qua ba điểm $A(1;0;0)$, $B(0;2;0)$, $C(0;0;3)$ có phương trình là?',
    explanation:
      'Phương trình mặt phẳng theo đoạn chắn: $\\dfrac{x}{1} + \\dfrac{y}{2} + \\dfrac{z}{3} = 1 \\Leftrightarrow 6x + 3y + 2z = 6$.',
    options: [
      { content: '$x + 2y + 3z = 6$', is_correct: false },
      { content: '$6x + 3y + 2z = 6$', is_correct: true },
      { content: '$3x + 2y + 6z = 6$', is_correct: false },
      { content: '$6x + 2y + 3z = 6$', is_correct: false },
    ],
  },
  // ---- Phần II: Đúng/Sai (chương Oxyz) ----
  {
    subjectCode: 'toan',
    chapterIdx: 4,
    type: 'multi_true_false',
    difficulty: 'van_dung',
    content:
      'Trong không gian $Oxyz$, cho hai điểm $A(1; 0; 0)$ và $B(0; 1; 0)$. Xét tính đúng/sai:',
    explanation:
      'a) Đúng, $\\vec{AB} = (-1; 1; 0)$. b) Đúng, $|\\vec{AB}| = \\sqrt2$. c) Đúng, trung điểm $I(\\frac12; \\frac12; 0)$. d) Sai, mặt cầu đường kính $AB$ có bán kính $\\dfrac{\\sqrt2}{2}$.',
    options: [
      { content: '$\\overrightarrow{AB} = (-1; 1; 0)$', is_correct: true },
      { content: '$|\\overrightarrow{AB}| = \\sqrt2$', is_correct: true },
      { content: 'Trung điểm của $AB$ là $\\left(\\dfrac12; \\dfrac12; 0\\right)$', is_correct: true },
      { content: 'Mặt cầu đường kính $AB$ có bán kính $\\sqrt2$', is_correct: false },
    ],
  },
  // ---- Phần III: trả lời ngắn (chương Oxyz) ----
  {
    subjectCode: 'toan',
    chapterIdx: 4,
    type: 'short_answer',
    difficulty: 'van_dung_cao',
    content:
      'Trong không gian $Oxyz$, tính cosin của góc giữa hai vectơ $\\vec{u} = (1; 2; 2)$ và $\\vec{v} = (2; 1; 0)$. (Nhập dạng $a/b$ tối giản, ví dụ 4/5.)',
    explanation:
      '$\\cos\\varphi = \\dfrac{2 + 2 + 0}{3 \\cdot \\sqrt5} = \\dfrac{4}{3\\sqrt5} = \\dfrac{4\\sqrt5}{15}$. Nhập dạng thập phân: $0.596$... Đáp án đơn giản nhất: $\\dfrac{4}{3\\sqrt5}$. Nhập: 4/(3sqrt5).',
    answerText: '4/(3sqrt5)',
  },

  // ============ VẬT LÝ ============
  // ---- Phần I: trắc nghiệm (chương Dao động cơ) ----
  {
    subjectCode: 'vatly',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Chu kỳ của dao động điều hòa là?',
    explanation:
      'Chu kỳ là thời gian để vật thực hiện một dao động toàn phần: $T = \\dfrac{2\\pi}{\\omega}$.',
    options: [
      { content: 'Thời gian vật đi được quãng đường bằng biên độ', is_correct: false },
      { content: 'Thời gian để vật thực hiện một dao động toàn phần', is_correct: true },
      { content: 'Số dao động trong một giây', is_correct: false },
      { content: 'Thời gian để vật đổi chiều chuyển động', is_correct: false },
    ],
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Trong dao động điều hòa, gia tốc của vật luôn?',
    explanation:
      'Gia tốc $a = -\\omega^2 x$ luôn hướng về vị trí cân bằng và ngược pha với li độ.',
    options: [
      { content: 'Cùng pha với li độ', is_correct: false },
      { content: 'Ngược pha với li độ', is_correct: true },
      { content: 'Vuông pha với li độ', is_correct: false },
      { content: 'Cùng pha với vận tốc', is_correct: false },
    ],
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Một vật dao động điều hòa với phương trình $x = 4\\cos(2\\pi t)$ cm. Biên độ dao động là?',
    explanation: 'So sánh với dạng chuẩn, biên độ $A = 4$ cm.',
    options: [
      { content: '2 cm', is_correct: false },
      { content: '4 cm', is_correct: true },
      { content: '6 cm', is_correct: false },
      { content: '$2\\pi$ cm', is_correct: false },
    ],
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Một con lắc lò xo có độ cứng $k = 100$ N/m, vật nặng $m = 400$ g. Chu kỳ dao động riêng là? (lấy $\\pi^2 = 10$)',
    explanation:
      '$T = 2\\pi\\sqrt{\\dfrac{m}{k}} = 2\\pi\\sqrt{\\dfrac{0.4}{100}} = 2\\pi\\sqrt{0.004} = 2\\pi \\cdot 0.0632 \\approx 0.4$ s.',
    options: [
      { content: '0.2 s', is_correct: false },
      { content: '0.4 s', is_correct: true },
      { content: '0.8 s', is_correct: false },
      { content: '1.0 s', is_correct: false },
    ],
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Con lắc lò xo dao động điều hòa theo phương ngang với biên độ $A = 5$ cm, độ cứng $k = 50$ N/m. Cơ năng của con lắc là?',
    explanation:
      '$W = \\dfrac12 k A^2 = \\dfrac12 \\cdot 50 \\cdot (0.05)^2 = 0.0625$ J.',
    options: [
      { content: '0.0625 J', is_correct: true },
      { content: '0.125 J', is_correct: false },
      { content: '0.625 J', is_correct: false },
      { content: '6.25 J', is_correct: false },
    ],
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Một con lắc đơn có chiều dài $l = 1$ m dao động tại nơi $g = \\pi^2$ m/s². Chu kỳ dao động là?',
    explanation:
      '$T = 2\\pi\\sqrt{\\dfrac{l}{g}} = 2\\pi\\sqrt{\\dfrac{1}{\\pi^2}} = 2\\pi \\cdot \\dfrac{1}{\\pi} = 2$ s.',
    options: [
      { content: '1 s', is_correct: false },
      { content: '2 s', is_correct: true },
      { content: '$2\\pi$ s', is_correct: false },
      { content: '0.5 s', is_correct: false },
    ],
  },
  // ---- Phần I: trắc nghiệm (chương Sóng cơ) ----
  {
    subjectCode: 'vatly',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Bước sóng là khoảng cách giữa hai điểm gần nhau nhất trên cùng một phương truyền sóng mà dao động?',
    explanation: 'Bước sóng là quãng đường sóng truyền trong một chu kỳ.',
    options: [
      { content: 'Cùng pha', is_correct: true },
      { content: 'Ngược pha', is_correct: false },
      { content: 'Vuông pha', is_correct: false },
      { content: 'Lệch pha $\\dfrac{\\pi}{4}$', is_correct: false },
    ],
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Một sóng cơ truyền trong một môi trường với tốc độ $v = 300$ m/s và tần số $f = 150$ Hz. Bước sóng là?',
    explanation: '$\\lambda = \\dfrac{v}{f} = \\dfrac{300}{150} = 2$ m.',
    options: [
      { content: '0.5 m', is_correct: false },
      { content: '2 m', is_correct: true },
      { content: '3 m', is_correct: false },
      { content: '450 m', is_correct: false },
    ],
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Sóng dọc là sóng mà các phần tử của môi trường dao động?',
    explanation: 'Sóng dọc: phương dao động trùng phương truyền sóng.',
    options: [
      { content: 'Vuông góc với phương truyền sóng', is_correct: false },
      { content: 'Trùng với phương truyền sóng', is_correct: true },
      { content: 'Theo phương ngang', is_correct: false },
      { content: 'Theo phương thẳng đứng', is_correct: false },
    ],
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Trong giao thoa sóng trên mặt nước, điểm dao động với biên độ cực đại khi hiệu đường đi bằng?',
    explanation: 'Cực đại khi $d_2 - d_1 = k\\lambda$.',
    options: [
      { content: '$k\\lambda$', is_correct: true },
      { content: '$(k + \\dfrac12)\\lambda$', is_correct: false },
      { content: '$(2k+1)\\dfrac{\\lambda}{2}$', is_correct: false },
      { content: '$(k+1)\\lambda$', is_correct: false },
    ],
  },
  // ---- Phần II: Đúng/Sai (chương Sóng cơ) ----
  {
    subjectCode: 'vatly',
    chapterIdx: 1,
    type: 'multi_true_false',
    difficulty: 'thong_hieu',
    content:
      'Một sóng hình sin truyền trên một sợi dây đàn hồi. Xét tính đúng/sai:',
    explanation:
      'a) Đúng. b) Đúng. c) Đúng, cùng pha cách nhau $k\\lambda$. d) Sai, bước sóng phụ thuộc tốc độ truyền sóng và tần số: $\\lambda = v/f$.',
    options: [
      { content: 'Tần số của sóng bằng tần số dao động của nguồn phát', is_correct: true },
      { content: 'Tốc độ truyền sóng phụ thuộc vào tính chất của môi trường', is_correct: true },
      { content: 'Hai điểm cùng pha gần nhất cách nhau một bước sóng', is_correct: true },
      { content: 'Bước sóng không phụ thuộc vào tốc độ truyền sóng', is_correct: false },
    ],
  },
  // ---- Phần III: trả lời ngắn (chương Sóng cơ) ----
  {
    subjectCode: 'vatly',
    chapterIdx: 1,
    type: 'short_answer',
    difficulty: 'van_dung',
    content:
      'Một sóng ngang truyền trên dây với tốc độ 20 m/s, chu kỳ 0.05 s. Tính bước sóng (m).',
    explanation: '$\\lambda = vT = 20 \\times 0.05 = 1$ m.',
    answerText: '1',
  },
  // ---- Phần I: trắc nghiệm (chương Điện xoay chiều) ----
  {
    subjectCode: 'vatly',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Trong mạch điện xoay chiều chỉ có điện trở thuần, điện áp và dòng điện?',
    explanation: 'Mạch chỉ có $R$: $u$ và $i$ cùng pha.',
    options: [
      { content: 'Cùng pha', is_correct: true },
      { content: 'Ngược pha', is_correct: false },
      { content: 'Vuông pha', is_correct: false },
      { content: 'Lệch pha $\\dfrac{\\pi}{4}$', is_correct: false },
    ],
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Trong mạch điện xoay chiều chỉ có tụ điện, dòng điện sớm pha hơn điện áp một góc?',
    explanation: 'Mạch chỉ có $C$: $i$ sớm pha hơn $u$ góc $\\dfrac{\\pi}{2}$.',
    options: [
      { content: '$\\dfrac{\\pi}{2}$', is_correct: true },
      { content: '$\\pi$', is_correct: false },
      { content: '0', is_correct: false },
      { content: '$\\dfrac{\\pi}{4}$', is_correct: false },
    ],
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Giá trị hiệu dụng của dòng điện xoay chiều $i = 2\\sqrt2 \\cos(100\\pi t)$ A là?',
    explanation: '$I = \\dfrac{I_0}{\\sqrt2} = \\dfrac{2\\sqrt2}{\\sqrt2} = 2$ A.',
    options: [
      { content: '1 A', is_correct: false },
      { content: '2 A', is_correct: true },
      { content: '$2\\sqrt2$ A', is_correct: false },
      { content: '4 A', is_correct: false },
    ],
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Trong mạch RLC nối tiếp đang xảy ra cộng hưởng, tổng trở của mạch bằng?',
    explanation: 'Khi cộng hưởng, $Z_L = Z_C$ nên $Z = R$.',
    options: [
      { content: '$Z_L$', is_correct: false },
      { content: '$Z_C$', is_correct: false },
      { content: '$R$', is_correct: true },
      { content: '0', is_correct: false },
    ],
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Mạch RLC nối tiếp có $R = 30$ Ω, $Z_L = 40$ Ω, $Z_C = 80$ Ω. Tổng trở của mạch là?',
    explanation:
      '$Z = \\sqrt{R^2 + (Z_L - Z_C)^2} = \\sqrt{30^2 + (40-80)^2} = \\sqrt{900 + 1600} = 50$ Ω.',
    options: [
      { content: '30 Ω', is_correct: false },
      { content: '50 Ω', is_correct: true },
      { content: '70 Ω', is_correct: false },
      { content: '150 Ω', is_correct: false },
    ],
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Đặt điện áp xoay chiều $u = 200\\cos(100\\pi t)$ V vào cuộn cảm có $L = \\dfrac{1}{\\pi}$ H. Cường độ hiệu dụng là?',
    explanation:
      '$Z_L = \\omega L = 100\\pi \\cdot \\dfrac{1}{\\pi} = 100$ Ω. $I = \\dfrac{U}{Z_L} = \\dfrac{200/\\sqrt2}{100} = \\dfrac{2}{\\sqrt2} = \\sqrt2 \\approx 1.41$ A.',
    options: [
      { content: '1 A', is_correct: false },
      { content: '$\\sqrt2$ A', is_correct: true },
      { content: '2 A', is_correct: false },
      { content: '$2\\sqrt2$ A', is_correct: false },
    ],
  },
  // ---- Phần II: Đúng/Sai (chương Điện xoay chiều) ----
  {
    subjectCode: 'vatly',
    chapterIdx: 2,
    type: 'multi_true_false',
    difficulty: 'van_dung',
    content:
      'Cho mạch điện xoay chiều RLC nối tiếp. Xét tính đúng/sai:',
    explanation:
      'a) Đúng, $u$ và $i$ cùng pha khi cộng hưởng. b) Đúng, công suất $P = UI\\cos\\varphi$. c) Sai, điện áp hiệu dụng hai đầu mạch không bằng tổng đại số các điện áp hiệu dụng (lệch pha). d) Đúng.',
    options: [
      { content: 'Khi cộng hưởng, điện áp hai đầu mạch cùng pha với dòng điện', is_correct: true },
      { content: 'Công suất tiêu thụ của mạch tính bằng $P = UI\\cos\\varphi$', is_correct: true },
      { content: 'Điện áp hiệu dụng hai đầu mạch bằng tổng các điện áp hiệu dụng từng phần tử', is_correct: false },
      { content: 'Hệ số công suất bằng 1 khi mạch cộng hưởng', is_correct: true },
    ],
  },
  // ---- Phần III: trả lời ngắn (chương Điện xoay chiều) ----
  {
    subjectCode: 'vatly',
    chapterIdx: 2,
    type: 'short_answer',
    difficulty: 'van_dung',
    content:
      'Một máy biến áp lý tưởng có số vòng cuộn sơ cấp 1000 vòng, thứ cấp 200 vòng. Đặt vào sơ cấp điện áp 220 V. Tính điện áp đầu ra (V).',
    explanation: '$\\dfrac{U_2}{U_1} = \\dfrac{N_2}{N_1} \\Rightarrow U_2 = 220 \\times \\dfrac{200}{1000} = 44$ V.',
    answerText: '44',
  },
  // ---- Phần I: trắc nghiệm (chương Lượng tử ánh sáng) ----
  {
    subjectCode: 'vatly',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Năng lượng của photon ánh sáng tỉ lệ nghịch với?',
    explanation: '$\\varepsilon = hf = \\dfrac{hc}{\\lambda}$: tỉ lệ nghịch với bước sóng.',
    options: [
      { content: 'Bước sóng', is_correct: true },
      { content: 'Tần số', is_correct: false },
      { content: 'Cường độ sáng', is_correct: false },
      { content: 'Vận tốc ánh sáng', is_correct: false },
    ],
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Giới hạn quang điện phụ thuộc vào?',
    explanation: 'Giới hạn quang điện chỉ phụ thuộc vào bản chất kim loại: $\\lambda_0 = \\dfrac{hc}{A}$.',
    options: [
      { content: 'Bản chất kim loại', is_correct: true },
      { content: 'Cường độ ánh sáng chiếu', is_correct: false },
      { content: 'Diện tích kim loại', is_correct: false },
      { content: 'Thời gian chiếu sáng', is_correct: false },
    ],
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Bức xạ có bước sóng nào sau đây gây ra hiện tượng quang điện với kim loại có giới hạn quang điện $\\lambda_0 = 0.5$ μm?',
    explanation: 'Hiện tượng quang điện xảy ra khi $\\lambda \\le \\lambda_0$. $0.4$ μm $< 0.5$ μm nên gây ra hiện tượng.',
    options: [
      { content: '$0.4$ μm', is_correct: true },
      { content: '$0.6$ μm', is_correct: false },
      { content: '$0.8$ μm', is_correct: false },
      { content: '$1.0$ μm', is_correct: false },
    ],
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Khi electron trong nguyên tử Hidro chuyển từ quỹ đạo dừng có mức năng lượng $E_2$ về $E_1$ ($E_2 > E_1$) thì phát ra photon có tần số?',
    explanation: '$hf = E_2 - E_1 \\Rightarrow f = \\dfrac{E_2 - E_1}{h}$.',
    options: [
      { content: '$\\dfrac{E_2 - E_1}{h}$', is_correct: true },
      { content: '$\\dfrac{E_1 - E_2}{h}$', is_correct: false },
      { content: '$\\dfrac{h}{E_2 - E_1}$', is_correct: false },
      { content: '$\\dfrac{E_2 + E_1}{h}$', is_correct: false },
    ],
  },
  // ---- Phần II: Đúng/Sai (chương Lượng tử ánh sáng) ----
  {
    subjectCode: 'vatly',
    chapterIdx: 3,
    type: 'multi_true_false',
    difficulty: 'thong_hieu',
    content:
      'Về hiện tượng quang điện ngoài, xét tính đúng/sai của các phát biểu sau:',
    explanation:
      'a) Đúng. b) Đúng, điều kiện $\\lambda \\le \\lambda_0$. c) Sai, động năng ban đầu cực đại không phụ thuộc cường độ sáng. d) Đúng.',
    options: [
      { content: 'Hiện tượng quang điện chỉ xảy ra khi ánh sáng kích thích có bước sóng nhỏ hơn giới hạn quang điện', is_correct: true },
      { content: 'Giới hạn quang điện phụ thuộc vào bản chất kim loại', is_correct: true },
      { content: 'Tăng cường độ ánh sáng thì động năng cực đại của electron tăng', is_correct: false },
      { content: 'Động năng cực đại của electron phụ thuộc vào tần số ánh sáng kích thích', is_correct: true },
    ],
  },
  // ---- Phần III: trả lời ngắn (chương Lượng tử ánh sáng) ----
  {
    subjectCode: 'vatly',
    chapterIdx: 3,
    type: 'short_answer',
    difficulty: 'van_dung',
    content:
      'Công thoát electron của một kim loại là $A = 3.3125 \\times 10^{-19}$ J. Cho $h = 6.625 \\times 10^{-34}$ J.s, $c = 3 \\times 10^8$ m/s. Tính giới hạn quang điện (μm).',
    explanation:
      '$\\lambda_0 = \\dfrac{hc}{A} = \\dfrac{6.625\\times10^{-34} \\times 3\\times10^8}{3.3125\\times10^{-19}} = 6\\times10^{-7}$ m $= 0.6$ μm.',
    answerText: '0.6',
  },

  // ============ HÓA HỌC ============
  // ---- Phần I: trắc nghiệm (chương Cấu tạo nguyên tử) ----
  {
    subjectCode: 'hoa',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content: 'Số proton trong hạt nhân nguyên tử $_{11}^{23}Na$ là?',
    explanation: 'Số proton $Z = 11$ (chỉ số dưới).',
    options: [
      { content: '11', is_correct: true },
      { content: '12', is_correct: false },
      { content: '23', is_correct: false },
      { content: '34', is_correct: false },
    ],
  },
  {
    subjectCode: 'hoa',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Số electron tối đa trên phân lớp s là?',
    explanation: 'Phân lớp s chứa tối đa 2 electron.',
    options: [
      { content: '2', is_correct: true },
      { content: '6', is_correct: false },
      { content: '10', is_correct: false },
      { content: '14', is_correct: false },
    ],
  },
  {
    subjectCode: 'hoa',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Cấu hình electron của nguyên tố $Z = 12$ là?',
    explanation: '$1s^2 2s^2 2p^6 3s^2$.',
    options: [
      { content: '$1s^2 2s^2 2p^6 3s^2$', is_correct: true },
      { content: '$1s^2 2s^2 2p^6 3s^1$', is_correct: false },
      { content: '$1s^2 2s^2 2p^6 3p^2$', is_correct: false },
      { content: '$1s^2 2s^2 2p^6 3s^2 3p^2$', is_correct: false },
    ],
  },
  {
    subjectCode: 'hoa',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Nguyên tố có $Z = 17$ thuộc nhóm nào trong bảng tuần hoàn?',
    explanation: '$1s^2 2s^2 2p^6 3s^2 3p^5$: có 7 electron lớp ngoài cùng nên thuộc nhóm VIIA.',
    options: [
      { content: 'Nhóm VA', is_correct: false },
      { content: 'Nhóm VIA', is_correct: false },
      { content: 'Nhóm VIIA', is_correct: true },
      { content: 'Nhóm VIIIA', is_correct: false },
    ],
  },
  {
    subjectCode: 'hoa',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Tổng số hạt (p, n, e) của nguyên tử $X$ là 40, số hạt mang điện nhiều hơn số hạt không mang điện là 12. Số khối của $X$ là?',
    explanation:
      '$2Z + N = 40$ và $2Z - N = 12$. Giải ra $Z = 13$, $N = 14$. Số khối $A = Z + N = 27$.',
    options: [
      { content: '13', is_correct: false },
      { content: '14', is_correct: false },
      { content: '26', is_correct: false },
      { content: '27', is_correct: true },
    ],
  },
  // ---- Phần II: Đúng/Sai (chương Cấu tạo nguyên tử) ----
  {
    subjectCode: 'hoa',
    chapterIdx: 0,
    type: 'multi_true_false',
    difficulty: 'thong_hieu',
    content:
      'Nguyên tử $_{17}^{35}Cl$ và $_{17}^{37}Cl$ là hai đồng vị. Xét tính đúng/sai:',
    explanation:
      'a) Đúng. b) Sai, cùng số proton nên tính chất hóa học giống nhau. c) Đúng. d) Đúng.',
    options: [
      { content: 'Chúng có cùng số proton', is_correct: true },
      { content: 'Chúng có tính chất hóa học khác nhau', is_correct: false },
      { content: 'Chúng có số nơtron khác nhau', is_correct: true },
      { content: 'Khối lượng nguyên tử của chúng khác nhau', is_correct: true },
    ],
  },
  // ---- Phần III: trả lời ngắn (chương Cấu tạo nguyên tử) ----
  {
    subjectCode: 'hoa',
    chapterIdx: 0,
    type: 'short_answer',
    difficulty: 'van_dung',
    content:
      'Nguyên tử $X$ có $Z = 26$. Số electron độc thân ở trạng thái cơ bản của $X$ là?',
    explanation:
      '$1s^2 2s^2 2p^6 3s^2 3p^6 3d^6 4s^2$. Phân lớp $3d^6$: $\\uparrow\\uparrow\\uparrow\\uparrow\\uparrow$ + $\\uparrow$ → 4 electron độc thân.',
    answerText: '4',
  },
  // ---- Phần I: trắc nghiệm (chương Phi kim) ----
  {
    subjectCode: 'hoa',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Khí nào sau đây gây mưa axit?',
    explanation: '$SO_2$ và $NO_x$ là nguyên nhân chính gây mưa axit.',
    options: [
      { content: '$SO_2$', is_correct: true },
      { content: '$N_2$', is_correct: false },
      { content: '$O_2$', is_correct: false },
      { content: '$CO$', is_correct: false },
    ],
  },
  {
    subjectCode: 'hoa',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Trong tự nhiên, các phi kim thường tồn tại ở dạng?',
    explanation: 'Các phi kim hoạt động mạnh thường tồn tại ở dạng hợp chất.',
    options: [
      { content: 'Đơn chất', is_correct: false },
      { content: 'Hợp chất', is_correct: true },
      { content: 'Hỗn hợp', is_correct: false },
      { content: 'Dung dịch', is_correct: false },
    ],
  },
  {
    subjectCode: 'hoa',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Khí clo phản ứng được với chất nào sau đây?',
    explanation: 'Clo phản ứng với $H_2$ tạo $HCl$ khi có ánh sáng hoặc nhiệt độ.',
    options: [
      { content: '$H_2$', is_correct: true },
      { content: '$N_2$', is_correct: false },
      { content: '$O_2$', is_correct: false },
      { content: '$CO_2$', is_correct: false },
    ],
  },
  {
    subjectCode: 'hoa',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Dung dịch nước clo có tính tẩy màu vì chứa?',
    explanation: 'Trong dung dịch nước clo có $HClO$ (axit hipoclorơ) có tính oxi hóa mạnh gây tẩy màu.',
    options: [
      { content: '$HClO$', is_correct: true },
      { content: '$HCl$', is_correct: false },
      { content: '$NaCl$', is_correct: false },
      { content: '$Cl_2$ tinh khiết', is_correct: false },
    ],
  },
  // ---- Phần II: Đúng/Sai (chương Phi kim) ----
  {
    subjectCode: 'hoa',
    chapterIdx: 1,
    type: 'multi_true_false',
    difficulty: 'thong_hieu',
    content:
      'Về khí $SO_2$, xét tính đúng/sai của các phát biểu sau:',
    explanation:
      'a) Đúng, $SO_2$ có tính khử và tính oxi hóa. b) Đúng. c) Đúng. d) Sai, nó là khí độc.',
    options: [
      { content: '$SO_2$ vừa có tính oxi hóa vừa có tính khử', is_correct: true },
      { content: '$SO_2$ làm mất màu dung dịch brom', is_correct: true },
      { content: '$SO_2$ là nguyên nhân gây mưa axit', is_correct: true },
      { content: '$SO_2$ là khí không độc', is_correct: false },
    ],
  },
  // ---- Phần III: trả lời ngắn (chương Phi kim) ----
  {
    subjectCode: 'hoa',
    chapterIdx: 1,
    type: 'short_answer',
    difficulty: 'van_dung',
    content:
      'Hấp thụ hết 4.48 lít khí $SO_2$ (đktc) vào dung dịch chứa 0.3 mol NaOH. Tính khối lượng muối thu được (gam).',
    explanation:
      '$n_{SO_2} = \\dfrac{4.48}{22.4} = 0.2$ mol. $\\dfrac{n_{NaOH}}{n_{SO_2}} = \\dfrac{0.3}{0.2} = 1.5$ → tạo 2 muối $NaHSO_3$ ($x$) và $Na_2SO_3$ ($y$): $x + y = 0.2$, $x + 2y = 0.3$ → $x = y = 0.1$. $m = 0.1\\times104 + 0.1\\times126 = 23$ g.',
    answerText: '23',
  },
  // ---- Phần I: trắc nghiệm (chương Hóa hữu cơ) ----
  {
    subjectCode: 'hoa',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Công thức phân tử của metan là?',
    explanation: 'Metan: $CH_4$.',
    options: [
      { content: '$CH_4$', is_correct: true },
      { content: '$C_2H_6$', is_correct: false },
      { content: '$C_2H_4$', is_correct: false },
      { content: '$C_3H_8$', is_correct: false },
    ],
  },
  {
    subjectCode: 'hoa',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Etilen có công thức phân tử là?',
    explanation: 'Etilen: $C_2H_4$ (có liên kết đôi).',
    options: [
      { content: '$C_2H_2$', is_correct: false },
      { content: '$C_2H_4$', is_correct: true },
      { content: '$C_2H_6$', is_correct: false },
      { content: '$C_2H_6O$', is_correct: false },
    ],
  },
  {
    subjectCode: 'hoa',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Phản ứng đặc trưng của anken là phản ứng?',
    explanation: 'Anken có liên kết đôi nên có phản ứng cộng.',
    options: [
      { content: 'Cộng', is_correct: true },
      { content: 'Thế', is_correct: false },
      { content: 'Tách', is_correct: false },
      { content: 'Trùng ngưng', is_correct: false },
    ],
  },
  {
    subjectCode: 'hoa',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Dung dịch chất nào sau đây làm đổi màu quỳ tím sang đỏ?',
    explanation: '$CH_3COOH$ là axit nên làm quỳ tím chuyển đỏ.',
    options: [
      { content: '$CH_3COOH$', is_correct: true },
      { content: '$C_2H_5OH$', is_correct: false },
      { content: '$CH_4$', is_correct: false },
      { content: '$C_6H_6$', is_correct: false },
    ],
  },
  {
    subjectCode: 'hoa',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Ancol etylic ($C_2H_5OH$) phản ứng với kim loại Na tạo khí?',
    explanation: '$2C_2H_5OH + 2Na \\rightarrow 2C_2H_5ONa + H_2$.',
    options: [
      { content: '$H_2$', is_correct: true },
      { content: '$O_2$', is_correct: false },
      { content: '$Cl_2$', is_correct: false },
      { content: '$CO_2$', is_correct: false },
    ],
  },
  // ---- Phần II: Đúng/Sai (chương Hóa hữu cơ) ----
  {
    subjectCode: 'hoa',
    chapterIdx: 2,
    type: 'multi_true_false',
    difficulty: 'van_dung',
    content:
      'Cho các chất $CH_4$, $C_2H_4$, $C_2H_5OH$, $CH_3COOH$. Xét tính đúng/sai:',
    explanation:
      'a) Đúng. b) Đúng, $C_2H_4$ làm mất màu nước brom. c) Đúng, $CH_3COOH$ làm quỳ hóa đỏ. d) Sai, $CH_4$ không tác dụng Na.',
    options: [
      { content: 'Metan là thành phần chính của khí thiên nhiên', is_correct: true },
      { content: 'Etilen làm mất màu dung dịch brom', is_correct: true },
      { content: 'Axit axetic làm quỳ tím hóa đỏ', is_correct: true },
      { content: 'Metan tác dụng được với kim loại Na', is_correct: false },
    ],
  },
  // ---- Phần III: trả lời ngắn (chương Hóa hữu cơ) ----
  {
    subjectCode: 'hoa',
    chapterIdx: 2,
    type: 'short_answer',
    difficulty: 'van_dung',
    content:
      'Đốt cháy hoàn toàn 4.48 lít $C_2H_4$ (đktc). Tính thể tích khí $CO_2$ sinh ra (lít, đktc).',
    explanation:
      '$C_2H_4 + 3O_2 \\rightarrow 2CO_2 + 2H_2O$. $n_{C_2H_4} = 0.2$ mol → $n_{CO_2} = 0.4$ mol → $V = 8.96$ lít.',
    answerText: '8.96',
  },
  // ---- Phần I: trắc nghiệm (chương Este - Lipit) ----
  {
    subjectCode: 'hoa',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Este đơn chức được tạo từ axit và ancol có công thức tổng quát?',
    explanation: 'Este no đơn chức: $C_nH_{2n}O_2$ (n ≥ 2).',
    options: [
      { content: '$C_nH_{2n}O_2$', is_correct: true },
      { content: '$C_nH_{2n}O$', is_correct: false },
      { content: '$C_nH_{2n+2}O_2$', is_correct: false },
      { content: '$C_nH_{2n-2}O_2$', is_correct: false },
    ],
  },
  {
    subjectCode: 'hoa',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Phản ứng thủy phân este trong môi trường axit là phản ứng?',
    explanation: 'Thủy phân este trong axit là phản ứng thuận nghịch.',
    options: [
      { content: 'Thuận nghịch', is_correct: true },
      { content: 'Một chiều', is_correct: false },
      { content: 'Oxi hóa - khử', is_correct: false },
      { content: 'Trùng hợp', is_correct: false },
    ],
  },
  {
    subjectCode: 'hoa',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Thủy phân $CH_3COOC_2H_5$ trong môi trường axit thu được?',
    explanation: '$CH_3COOC_2H_5 + H_2O \\rightleftharpoons CH_3COOH + C_2H_5OH$.',
    options: [
      { content: '$CH_3COOH$ và $C_2H_5OH$', is_correct: true },
      { content: '$CH_3COONa$ và $C_2H_5OH$', is_correct: false },
      { content: '$CH_3COOH$ và $C_2H_4$', is_correct: false },
      { content: '$C_2H_5OH$ và $CO_2$', is_correct: false },
    ],
  },
  {
    subjectCode: 'hoa',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Chất béo là trieste của glixerol với?',
    explanation: 'Chất béo là trieste của glixerol với các axit béo.',
    options: [
      { content: 'Axit béo', is_correct: true },
      { content: 'Axit vô cơ', is_correct: false },
      { content: 'Axit amino', is_correct: false },
      { content: 'Ancol đa chức khác', is_correct: false },
    ],
  },
  {
    subjectCode: 'hoa',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Xà phòng hóa hoàn toàn 17.8 gam $CH_3COOC_2H_5$ ($M = 88$) bằng dung dịch NaOH dư. Khối lượng muối thu được là?',
    explanation:
      '$n_{este} = \\dfrac{17.8}{88} = 0.202$ mol. $m_{CH_3COONa} = 0.202 \\times 82 \\approx 16.6$ g.',
    options: [
      { content: '16.6 gam', is_correct: true },
      { content: '14.8 gam', is_correct: false },
      { content: '18.5 gam', is_correct: false },
      { content: '12.3 gam', is_correct: false },
    ],
  },
  // ---- Phần II: Đúng/Sai (chương Este - Lipit) ----
  {
    subjectCode: 'hoa',
    chapterIdx: 3,
    type: 'multi_true_false',
    difficulty: 'van_dung',
    content:
      'Thủy phân este $CH_3COOCH_3$ bằng dung dịch NaOH. Xét tính đúng/sai:',
    explanation:
      'a) Đúng, phản ứng xà phòng hóa. b) Đúng, thu được $CH_3COONa$ và $CH_3OH$. c) Sai, phản ứng một chiều. d) Đúng.',
    options: [
      { content: 'Phản ứng gọi là phản ứng xà phòng hóa', is_correct: true },
      { content: 'Sản phẩm gồm $CH_3COONa$ và $CH_3OH$', is_correct: true },
      { content: 'Phản ứng là phản ứng thuận nghịch', is_correct: false },
      { content: 'Phản ứng thủy phân xảy ra hoàn toàn', is_correct: true },
    ],
  },
  // ---- Phần III: trả lời ngắn (chương Este - Lipit) ----
  {
    subjectCode: 'hoa',
    chapterIdx: 3,
    type: 'short_answer',
    difficulty: 'van_dung_cao',
    content:
      'Thủy phân hoàn toàn m gam este $C_4H_8O_2$ ($M = 88$) bằng dung dịch NaOH vừa đủ thu được 8.2 gam muối. Tính m (gam).',
    explanation:
      'Este $C_4H_8O_2$ no đơn chức. Giả sử là $CH_3COOC_2H_5$ ($M = 88$), muối $CH_3COONa$ ($M = 82$). $n_{muối} = \\dfrac{8.2}{82} = 0.1$ mol = $n_{este}$. $m = 0.1 \\times 88 = 8.8$ g.',
    answerText: '8.8',
  },

  // ============ TIẾNG ANH ============
  // ---- Phần I: trắc nghiệm (chương Phát âm) ----
  {
    subjectCode: 'anh',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Choose the word whose underlined part differs from the other three in pronunciation: **A. cat** **B. hat** **C. car** **D. map**',
    explanation: '"car" phát âm /ɑː/, các từ còn lại /æ/.',
    options: [
      { content: 'cat', is_correct: false },
      { content: 'hat', is_correct: false },
      { content: 'car', is_correct: true },
      { content: 'map', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Choose the word whose main stress is placed differently from the others: **A. teacher** **B. student** **C. hotel** **D. table**',
    explanation: '"hotel" trọng âm rơi vào âm tiết 2, các từ còn lại âm tiết 1.',
    options: [
      { content: 'teacher', is_correct: false },
      { content: 'student', is_correct: false },
      { content: 'hotel', is_correct: true },
      { content: 'table', is_correct: false },
    ],
  },
  // ---- Phần I: trắc nghiệm (chương Từ vựng - Ngữ pháp) ----
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'She ____ to school every day by bus.',
    explanation: 'Hiện tại đơn với ngôi "she": goes.',
    options: [
      { content: 'go', is_correct: false },
      { content: 'goes', is_correct: true },
      { content: 'going', is_correct: false },
      { content: 'gone', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Choose the correct article: He is ____ honest man.',
    explanation: '"honest" bắt đầu bằng âm /ɒ/, phát âm như nguyên âm → dùng "an".',
    options: [
      { content: 'a', is_correct: false },
      { content: 'an', is_correct: true },
      { content: 'the', is_correct: false },
      { content: 'no article', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'If I ____ you, I would accept the offer.',
    explanation: 'Câu điều kiện loại 2: mệnh đề if dùng quá khứ đơn "were".',
    options: [
      { content: 'am', is_correct: false },
      { content: 'was', is_correct: false },
      { content: 'were', is_correct: true },
      { content: 'be', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'The book ____ by that famous author was very interesting.',
    explanation: 'Rút gọn mệnh đề quan hệ bị động: "written".',
    options: [
      { content: 'writes', is_correct: false },
      { content: 'written', is_correct: true },
      { content: 'writing', is_correct: false },
      { content: 'wrote', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'She has been working here ____ 2019.',
    explanation: '"since" dùng với mốc thời gian trong quá khứ khi thì hiện tại hoàn thành tiếp diễn.',
    options: [
      { content: 'for', is_correct: false },
      { content: 'since', is_correct: true },
      { content: 'from', is_correct: false },
      { content: 'during', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Choose the sentence that is closest in meaning: "It\'s a long time since he last visited us."',
    explanation: '"It\'s a long time since..." ⟺ "He hasn\'t visited us for a long time."',
    options: [
      { content: 'He hasn\'t visited us for a long time', is_correct: true },
      { content: 'He has visited us recently', is_correct: false },
      { content: 'He visited us every week', is_correct: false },
      { content: 'He will visit us soon', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Choose the word that is CLOSEST in meaning to "abandon":',
    explanation: '"abandon" (từ bỏ) ≈ "give up".',
    options: [
      { content: 'keep', is_correct: false },
      { content: 'give up', is_correct: true },
      { content: 'start', is_correct: false },
      { content: 'continue', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'van_dung_cao',
    content:
      'Choose the sentence that is closest in meaning: "No one in the class is taller than Peter."',
    explanation: '"No one is taller than Peter" ⟺ "Peter is the tallest in the class."',
    options: [
      { content: 'Peter is the tallest in the class', is_correct: true },
      { content: 'Peter is shorter than everyone', is_correct: false },
      { content: 'Everyone is taller than Peter', is_correct: false },
      { content: 'Peter is as tall as everyone', is_correct: false },
    ],
  },
  // ---- Phần I: trắc nghiệm (chương Đọc hiểu) ----
  {
    subjectCode: 'anh',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Read the passage: "Many people enjoy reading books because they help us learn new things and relax. Books can take us to different worlds." — The main idea of the passage is that books ____.',
    explanation: 'Ý chính: sách giúp ta học hỏi và thư giãn → "are useful for learning and relaxation".',
    options: [
      { content: 'are expensive', is_correct: false },
      { content: 'are useful for learning and relaxation', is_correct: true },
      { content: 'are difficult to read', is_correct: false },
      { content: 'are only for children', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      '"The weather was beautiful, so we decided to go to the beach." The word "so" shows ____.',
    explanation: '"so" diễn tả kết quả (result).',
    options: [
      { content: 'a result', is_correct: true },
      { content: 'a reason', is_correct: false },
      { content: 'a contrast', is_correct: false },
      { content: 'a time', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      '"Despite the heavy rain, the match continued." This means ____.',
    explanation: '"Despite" diễn tả sự nhượng bộ: trận đấu vẫn tiếp tục dù mưa lớn.',
    options: [
      { content: 'The match was cancelled due to rain', is_correct: false },
      { content: 'The match went on although it rained heavily', is_correct: true },
      { content: 'The rain stopped the match', is_correct: false },
      { content: 'The match started after the rain', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Choose the correct word to fill in the blank: "She ___ the report before she left the office yesterday."',
    explanation: 'Hành động xảy ra trước một hành động trong quá khứ → quá khứ hoàn thành "had finished".',
    options: [
      { content: 'finishes', is_correct: false },
      { content: 'finished', is_correct: false },
      { content: 'had finished', is_correct: true },
      { content: 'has finished', is_correct: false },
    ],
  },
  // ---- Phần I: trắc nghiệm (chương Viết lại câu) ----
  {
    subjectCode: 'anh',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Choose the sentence that has the same meaning as: "He is too young to drive a car."',
    explanation: '"too young to drive" ⟺ "not old enough to drive".',
    options: [
      { content: 'He is old enough to drive a car', is_correct: false },
      { content: 'He is not old enough to drive a car', is_correct: true },
      { content: 'He can drive a car easily', is_correct: false },
      { content: 'He used to drive a car', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Choose the sentence closest in meaning to: "She said, \'I will come tomorrow.\'"',
    explanation: 'Câu gián tiếp: "She said she would come the next day."',
    options: [
      { content: 'She said she would come the next day', is_correct: true },
      { content: 'She said she will come tomorrow', is_correct: false },
      { content: 'She said I would come tomorrow', is_correct: false },
      { content: 'She said she came yesterday', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Choose the correct answer: "The house ____ in 1990 is still beautiful."',
    explanation: 'Rút gọn mệnh đề quan hệ bị động: "built".',
    options: [
      { content: 'built', is_correct: true },
      { content: 'building', is_correct: false },
      { content: 'build', is_correct: false },
      { content: 'to build', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Choose the sentence closest in meaning to: "Although it was raining, they went out."',
    explanation: '"Although it was raining" ⟺ "In spite of the rain".',
    options: [
      { content: 'In spite of the rain, they went out', is_correct: true },
      { content: 'Because of the rain, they went out', is_correct: false },
      { content: 'They went out because it was raining', is_correct: false },
      { content: 'They stayed home because of the rain', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Choose the word whose underlined part differs from the other three in pronunciation: **A. think** **B. thin** **C. this** **D. thank**',
    explanation: '"this" phát âm /ð/, các từ còn lại /θ/.',
    options: [
      { content: 'think', is_correct: false },
      { content: 'thin', is_correct: false },
      { content: 'this', is_correct: true },
      { content: 'thank', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 0,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Choose the word whose main stress is placed differently from the others: **A. result** **B. decide** **C. happy** **D. provide**',
    explanation: '"happy" trọng âm rơi vào âm tiết 1, các từ còn lại âm tiết 2.',
    options: [
      { content: 'result', is_correct: false },
      { content: 'decide', is_correct: false },
      { content: 'happy', is_correct: true },
      { content: 'provide', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'They have lived in this city ____ 2010.',
    explanation: '"since" dùng với mốc thời gian trong quá khứ.',
    options: [
      { content: 'for', is_correct: false },
      { content: 'since', is_correct: true },
      { content: 'during', is_correct: false },
      { content: 'from', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Choose the correct form: "She ____ TV when the phone rang."',
    explanation: 'Hành động đang diễn ra bị cắt ngang bởi hành động khác trong quá khứ → quá khứ tiếp diễn "was watching".',
    options: [
      { content: 'watches', is_correct: false },
      { content: 'watched', is_correct: false },
      { content: 'was watching', is_correct: true },
      { content: 'has watched', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'nhan_biet',
    content:
      'Choose the correct question tag: "You are a student, ____?"',
    explanation: 'Câu khẳng định + "you are" → tag "aren\'t you".',
    options: [
      { content: 'aren\'t you', is_correct: true },
      { content: 'are you', is_correct: false },
      { content: 'do you', is_correct: false },
      { content: 'don\'t you', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Choose the correct answer: "The more you practice, ____ you will become."',
    explanation: 'So sánh kép: "The more ..., the better ...".',
    options: [
      { content: 'the better', is_correct: true },
      { content: 'better', is_correct: false },
      { content: 'the best', is_correct: false },
      { content: 'good', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Choose the word that is OPPOSITE in meaning to "generous":',
    explanation: '"generous" (hào phóng) trái nghĩa "stingy" (keo kiệt).',
    options: [
      { content: 'kind', is_correct: false },
      { content: 'helpful', is_correct: false },
      { content: 'stingy', is_correct: true },
      { content: 'friendly', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Choose the correct passive form: "They will build a new bridge here."',
    explanation: 'Bị động tương lai: "A new bridge will be built here."',
    options: [
      { content: 'A new bridge will be built here', is_correct: true },
      { content: 'A new bridge will build here', is_correct: false },
      { content: 'A new bridge is built here', is_correct: false },
      { content: 'A new bridge was built here', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Choose the correct answer: "I wish I ____ more time to study."',
    explanation: 'Câu ước ở hiện tại (không có thực) → quá khứ đơn "had".',
    options: [
      { content: 'have', is_correct: false },
      { content: 'had', is_correct: true },
      { content: 'will have', is_correct: false },
      { content: 'would have', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Choose the correct answer: "By the time you arrive, I ____ the report."',
    explanation: 'Hành động hoàn thành trước một mốc tương lai → tương lai hoàn thành "will have finished".',
    options: [
      { content: 'finish', is_correct: false },
      { content: 'will finish', is_correct: false },
      { content: 'will have finished', is_correct: true },
      { content: 'finished', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Choose the correct answer: "She suggested ____ to the museum."',
    explanation: '"suggest + V-ing": "suggest going".',
    options: [
      { content: 'go', is_correct: false },
      { content: 'going', is_correct: true },
      { content: 'to go', is_correct: false },
      { content: 'went', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Choose the sentence that is closest in meaning to: "I haven\'t seen her for two weeks."',
    explanation: '"haven\'t seen for two weeks" ⟺ "last saw her two weeks ago".',
    options: [
      { content: 'I last saw her two weeks ago', is_correct: true },
      { content: 'I saw her two weeks ago for the first time', is_correct: false },
      { content: 'She has seen me for two weeks', is_correct: false },
      { content: 'I will see her in two weeks', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 1,
    type: 'single_choice',
    difficulty: 'van_dung_cao',
    content:
      'Choose the correct answer: "Not only ____ but she also sings beautifully."',
    explanation: 'Đảo ngữ với "Not only": "does she play the piano well".',
    options: [
      { content: 'does she play the piano well', is_correct: true },
      { content: 'she plays the piano well', is_correct: false },
      { content: 'she does play the piano well', is_correct: false },
      { content: 'plays she the piano well', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Read the sentence: "The government is trying to reduce pollution by encouraging people to use public transport." The word "reduce" is closest in meaning to ____.',
    explanation: '"reduce" (giảm) ≈ "decrease".',
    options: [
      { content: 'increase', is_correct: false },
      { content: 'decrease', is_correct: true },
      { content: 'ignore', is_correct: false },
      { content: 'create', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      '"She speaks English fluently." The adverb "fluently" describes ____.',
    explanation: '"fluently" là trạng từ bổ nghĩa cho động từ "speaks".',
    options: [
      { content: 'the subject', is_correct: false },
      { content: 'the verb', is_correct: true },
      { content: 'the object', is_correct: false },
      { content: 'the noun', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Read the sentence: "Many species are in danger of extinction because their habitats are being destroyed." The word "extinction" means ____.',
    explanation: '"extinction" (sự tuyệt chủng) ≈ "dying out".',
    options: [
      { content: 'dying out', is_correct: true },
      { content: 'growing up', is_correct: false },
      { content: 'moving away', is_correct: false },
      { content: 'coming back', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 2,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Choose the correct answer to fill the blank: "The report ____ by the end of this week will be presented to the board."',
    explanation: 'Rút gọn mệnh đề quan hệ bị động (tương lai): "to be completed".',
    options: [
      { content: 'to be completed', is_correct: true },
      { content: 'completing', is_correct: false },
      { content: 'completed', is_correct: false },
      { content: 'complete', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Choose the sentence that is closest in meaning to: "He doesn\'t have enough money to buy that car."',
    explanation: '"không đủ tiền để mua" ⟺ "He is too poor to buy that car."',
    options: [
      { content: 'He is too poor to buy that car', is_correct: true },
      { content: 'He has enough money to buy that car', is_correct: false },
      { content: 'He can easily buy that car', is_correct: false },
      { content: 'That car is cheap enough for him', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'thong_hieu',
    content:
      'Choose the correct answer: "The man ____ next to me is my uncle."',
    explanation: 'Rút gọn mệnh đề quan hệ chủ động: "sitting".',
    options: [
      { content: 'sitting', is_correct: true },
      { content: 'sit', is_correct: false },
      { content: 'sat', is_correct: false },
      { content: 'to sit', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Choose the sentence that is closest in meaning to: "The film was so boring that we left early."',
    explanation: '"so ... that" ⟺ "It was such a boring film that we left early."',
    options: [
      { content: 'It was such a boring film that we left early', is_correct: true },
      { content: 'The film was too exciting for us', is_correct: false },
      { content: 'We stayed until the end', is_correct: false },
      { content: 'The film was interesting enough', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'van_dung',
    content:
      'Choose the sentence that is closest in meaning to: "I regret not studying harder when I was at school."',
    explanation: '"regret not doing" ⟺ "I wish I had studied harder when I was at school."',
    options: [
      { content: 'I wish I had studied harder when I was at school', is_correct: true },
      { content: 'I am glad I studied hard', is_correct: false },
      { content: 'I studied harder than anyone', is_correct: false },
      { content: 'I will study harder in the future', is_correct: false },
    ],
  },
  {
    subjectCode: 'anh',
    chapterIdx: 3,
    type: 'single_choice',
    difficulty: 'van_dung_cao',
    content:
      'Choose the sentence that is closest in meaning to: "No sooner had he arrived than the meeting started."',
    explanation: '"No sooner had ... than" ⟺ "As soon as he arrived, the meeting started."',
    options: [
      { content: 'As soon as he arrived, the meeting started', is_correct: true },
      { content: 'The meeting started before he arrived', is_correct: false },
      { content: 'He arrived after the meeting started', is_correct: false },
      { content: 'The meeting never started', is_correct: false },
    ],
  },
  // VẬT LÝ bổ sung
  {
    subjectCode: 'vatly',
    chapterIdx: 0,
    type: 'multi_true_false',
    difficulty: 'thong_hieu',
    content:
      'Một vật dao động điều hòa theo phương trình $x = 5\\cos(2\\pi t)$ cm. Xét tính đúng/sai:',
    explanation:
      'a) Đúng, $A = 5$ cm. b) Đúng, $\\omega = 2\\pi$ nên $T = 1$ s. c) Đúng, $f = 1$ Hz. d) Sai, vận tốc cực đại $v_{max} = \\omega A = 10\\pi$ cm/s.',
    options: [
      { content: 'Biên độ dao động là 5 cm', is_correct: true },
      { content: 'Chu kỳ dao động là 1 giây', is_correct: true },
      { content: 'Tần số dao động là 1 Hz', is_correct: true },
      { content: 'Vận tốc cực đại là $5\\pi$ cm/s', is_correct: false },
    ],
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 0,
    type: 'short_answer',
    difficulty: 'van_dung',
    content:
      'Một vật dao động điều hòa với phương trình $x = 4\\cos(\\pi t - \\dfrac{\\pi}{2})$ cm. Tính quãng đường vật đi được trong 2 giây đầu tiên (cm).',
    explanation:
      '$T = \\dfrac{2\\pi}{\\pi} = 2$ s. Trong 2 s (một chu kỳ), quãng đường $S = 4A = 16$ cm.',
    answerText: '16',
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 1,
    type: 'short_answer',
    difficulty: 'van_dung',
    content:
      'Một sóng có bước sóng 2 m, tần số 50 Hz. Tính tốc độ truyền sóng (m/s).',
    explanation: '$v = \\lambda f = 2 \\times 50 = 100$ m/s.',
    answerText: '100',
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 2,
    type: 'short_answer',
    difficulty: 'van_dung',
    content:
      'Một mạch RLC nối tiếp có $R = 40$ Ω, $Z_L = 80$ Ω, $Z_C = 20$ Ω, điện áp hiệu dụng 100 V. Tính công suất tiêu thụ của mạch (W).',
    explanation:
      '$Z = \\sqrt{R^2 + (Z_L - Z_C)^2} = \\sqrt{40^2 + 60^2} = 10\\sqrt{52} \\approx 72.1$ Ω. $I = \\dfrac{U}{Z} = \\dfrac{100}{72.1} \\approx 1.387$ A. $P = I^2 R = 1.387^2 \\times 40 \\approx 77$ W.',
    answerText: '77',
  },
  {
    subjectCode: 'vatly',
    chapterIdx: 3,
    type: 'short_answer',
    difficulty: 'van_dung',
    content:
      'Cho $h = 6.625 \\times 10^{-34}$ J.s, $c = 3 \\times 10^8$ m/s. Tính năng lượng của photon có bước sóng $0.5$ μm, đơn vị $10^{-19}$ J (làm tròn 1 chữ số thập phân).',
    explanation:
      '$\\varepsilon = \\dfrac{hc}{\\lambda} = \\dfrac{6.625\\times10^{-34} \\times 3\\times10^8}{0.5\\times10^{-6}} = 3.975\\times10^{-19}$ J.',
    answerText: '4',
  },
  // HÓA HỌC bổ sung
  {
    subjectCode: 'hoa',
    chapterIdx: 0,
    type: 'short_answer',
    difficulty: 'van_dung',
    content:
      'Nguyên tử nguyên tố $X$ có $Z = 15$. Số electron độc thân ở trạng thái cơ bản là?',
    explanation:
      '$1s^2 2s^2 2p^6 3s^2 3p^3$. Phân lớp $3p^3$ có 3 electron độc thân (quy tắc Hund).',
    answerText: '3',
  },
  {
    subjectCode: 'hoa',
    chapterIdx: 1,
    type: 'short_answer',
    difficulty: 'van_dung',
    content:
      'Sục 2.24 lít khí $CO_2$ (đktc) vào dung dịch chứa 0.1 mol $Ca(OH)_2$. Tính khối lượng kết tủa thu được (gam).',
    explanation:
      '$n_{CO_2} = 0.1$ mol, $n_{Ca(OH)_2} = 0.1$ mol. Tỉ lệ 1:1 → tạo $CaCO_3$ 0.1 mol → $m = 100 \\times 0.1 = 10$ g.',
    answerText: '10',
  },
  {
    subjectCode: 'hoa',
    chapterIdx: 2,
    type: 'short_answer',
    difficulty: 'van_dung',
    content:
      'Đốt cháy hoàn toàn 6.72 lít hỗn hợp metan và etilen (đktc) thu được 13.44 lít $CO_2$ (đktc). Tính thể tích etilen trong hỗn hợp (lít).',
    explanation:
      'Gọi $x = n_{CH_4}$, $y = n_{C_2H_4}$. $x + y = 0.3$, $x + 2y = 0.6$. Giải: $x = 0$, $y = 0.3$ → $V_{C_2H_4} = 6.72$ lít.',
    answerText: '6.72',
  },
  {
    subjectCode: 'hoa',
    chapterIdx: 3,
    type: 'short_answer',
    difficulty: 'van_dung',
    content:
      'Xà phòng hóa hoàn toàn 11.1 gam hỗn hợp hai este đơn chức (cùng $M = 74$) bằng dung dịch NaOH vừa đủ. Tính tổng khối lượng muối thu được nếu hai este là đồng phân $C_3H_6O_2$ tương ứng muối có $M = 68$ và $M = 96$ (gam, làm tròn 1 chữ số).',
    explanation:
      '$n_{este} = \\dfrac{11.1}{74} = 0.15$ mol. $n_{muối} = 0.15$ mol. Khối lượng muối trung bình: $(68 + 96)/2 = 82$ → $m = 0.15 \\times 82 = 12.3$ g.',
    answerText: '12.3',
  },
];
