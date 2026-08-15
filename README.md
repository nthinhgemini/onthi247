# Ôn thi 2029 — Luyện thi THPT Quốc gia

Nền tảng ôn thi THPT Quốc gia: ngân hàng câu hỏi, tạo đề theo ma trận, làm bài thi thử, chấm điểm tự động và xem lại lời giải.

## Kiến trúc

| Thành phần | Công nghệ | Thư mục |
|---|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript + TailwindCSS 4 + React Query + KaTeX | `frontend/` (port 3000) |
| Backend | NestJS 11 + Prisma + PostgreSQL | `backend/` (port 3001) |

## Cài đặt & chạy

### 1. Khởi động PostgreSQL (Dev environment)

```bash
docker-compose up -d           # Chạy PostgreSQL 16 tại localhost:5432
```

### 2. Backend

```bash
cd backend
cp .env.example .env          # Cấu hình kết nối DATABASE_URL & OAuth
npm install
npx prisma db push            # Đồng bộ schema lên PostgreSQL
npm run db:seed               # Seed môn học, chuyên đề, tài khoản, câu hỏi mẫu
npm run start:dev             # Chạy backend tại http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                   # Chạy frontend tại http://localhost:3000
```

### Tài khoản mặc định (seed)

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | admin@onthi2029.vn | admin123 |
| Giáo viên | teacher@onthi2029.vn | teacher123 |
| Học sinh | student@onthi2029.vn | student123 |

## Tính năng đã có

- **Xác thực & Bảo mật**:
  - Đăng ký/đăng nhập, JWT (access + refresh, tự động refresh), phân quyền student/teacher/admin
  - **Đăng nhập Google OAuth**: Tự động tạo tài khoản hoặc liên kết với tài khoản email đã tồn tại (`oauth_provider`, `oauth_id`), lưu HttpOnly cookie cho token
  - **Quên mật khẩu & Đặt lại mật khẩu**: Gửi mail link reset (token hiệu lực 15 phút), Rate limit 3 lượt/email/giờ, tự động thu hồi (`token_version`) toàn bộ refresh token cũ sau khi đổi mật khẩu
- **Cơ sở dữ liệu PostgreSQL**:
  - Đã chuyển đổi hoàn toàn sang PostgreSQL 16
  - Tối ưu hóa hiệu năng truy vấn với các index: `Submission(user_id)`, `Submission(exam_id)`, `Submission(user_id, status)`, `SubmissionAnswer(submission_id)`, `UserBadge(user_id, badge_id)`
- **Ngân hàng câu hỏi**: CRUD câu hỏi (trắc nghiệm, điền đáp án, đúng/sai 4 ý), gắn môn/chuyên đề/mức độ, hỗ trợ LaTeX, lọc theo subject/chapter/difficulty/status
- **Tạo đề thi**: Tự sinh theo ma trận (`exams/generate`) hoặc chọn câu thủ công, presets theo đề THPT Quốc gia
- **Làm bài thi**: Countdown tính từ `started_at` (chống gian lận + ép thời gian server-side grace 2 min), đánh dấu câu đã làm/chưa làm/nghi vấn, auto-save mỗi 20s, auto-submit khi hết giờ, hiển thị LaTeX/hình ảnh responsive
- **Chấm điểm**: Thang 10 theo trọng số câu, trắc nghiệm/điền đáp án; câu **Đúng/Sai 4 ý** chấm điểm bộ phận theo chuẩn Bộ GD-ĐT 2025 (đúng 4/4 → 1.0đ, 3/4 → 0.5đ, 2/4 → 0.25đ, ≤1/4 → 0đ)
- **Xem lại & Thống kê**: Đúng/sai từng câu, đáp án đúng, lời giải chi tiết (KaTeX), lịch sử bài làm, dashboard `/stats` (level/XP/streak/biểu đồ 30 ngày/chuyên đề yếu), bảng xếp hạng `/leaderboard` (invalidate cache real-time)
- **Trang quản trị** (`/admin`): Dashboard tổng quan, quản lý & khóa/mở tài khoản, duyệt/từ chối câu hỏi
- **Diễn đàn hỏi đáp** (`/forum`): Đăng bài, upvote, chọn trả lời hay nhất (đã giải), bình luận, xóa bài/bình luận
- **Thông báo trong app**: Chuông thông báo header, thông báo huy hiệu mới, bài viết/bình luận

## Scripts hữu ích

```bash
# Backend
cd backend
npx prisma db push      # Đồng bộ schema Prisma với PostgreSQL
npm run db:seed        # Seed dữ liệu mẫu
npm run test:e2e       # Toàn bộ test integration E2E (auth, OAuth, reset pass, câu hỏi, chấm điểm, gamification, admin...)
npm run lint && npm run build

# Frontend
cd frontend
npm run lint           # ESLint check (0 errors, 0 warnings)
npx tsc --noEmit       # TypeScript check
npm run build          # Production build
```

## Cấu trúc API chính

```
POST   /api/auth/register | login | refresh
GET    /api/auth/google | /callback
POST   /api/auth/forgot-password | reset-password | verify-reset-token
GET    /api/users/me        PATCH /api/users/me
GET    /api/subjects        GET /api/subjects/:id/chapters
GET    /api/questions       POST/PATCH /api/questions
POST   /api/exams           POST /api/exams/generate
GET    /api/exams/:id
POST   /api/submissions/exams/:examId/start
POST   /api/submissions/:id/save
POST   /api/submissions/:id/submit
GET    /api/submissions     GET /api/submissions/:id/review
GET    /api/stats/me/overview | progress | weak-chapters | badges
GET    /api/stats/leaderboard
GET    /api/admin/overview | users | questions      (admin)
PATCH  /api/admin/users/:id | /api/admin/questions/:id/moderate   (admin)
GET    /api/forum/posts          POST /api/forum/posts
GET    /api/forum/posts/:id      PATCH/DELETE /api/forum/posts/:id
POST   /api/forum/posts/:id/vote
POST   /api/forum/posts/:id/comments
PATCH  /api/forum/posts/:id/best/:commentId
DELETE /api/forum/posts/:id/comments/:commentId
GET    /api/users/me/notifications
PATCH  /api/users/me/notifications/:id/read | /read
```

## Giai đoạn tiếp theo

- Deployment CI/CD (Vercel + Railway/Render + Supabase PostgreSQL)
- Live chat / Real-time study groups