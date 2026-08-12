# Ôn thi 2029 — Luyện thi THPT Quốc gia

Nền tảng ôn thi THPT Quốc gia: ngân hàng câu hỏi, tạo đề theo ma trận, làm bài thi thử, chấm điểm tự động và xem lại lời giải.

## Kiến trúc

| Thành phần | Công nghệ | Thư mục |
|---|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript + TailwindCSS 4 + React Query + KaTeX | `frontend/` (port 3000) |
| Backend | NestJS 11 + Prisma + SQLite | `backend/` (port 3001) |

## Cài đặt & chạy

### 1. Backend

```bash
cd backend
npm install
npx prisma migrate dev        # tạo DB + schema
npm run db:seed               # seed môn học, chuyên đề, tài khoản, câu hỏi mẫu
npm run start:dev             # chạy tại http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                   # chạy tại http://localhost:3000
```

### Tài khoản mặc định (seed)

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | admin@onthi2029.vn | admin123 |
| Giáo viên | teacher@onthi2029.vn | teacher123 |
| Học sinh | student@onthi2029.vn | student123 |

## Tính năng đã có

- **Xác thực**: đăng ký/đăng nhập, JWT (access + refresh, tự động refresh), phân quyền student/teacher/admin
- **Ngân hàng câu hỏi**: CRUD câu hỏi (trắc nghiệm, điền đáp án, đúng/sai 4 ý), gắn môn/chuyên đề/mức độ, hỗ trợ LaTeX, lọc theo subject/chapter/difficulty/status
- **Tạo đề thi**: tự sinh theo ma trận (`exams/generate`) hoặc chọn câu thủ công, presets theo đề THPT Quốc gia
- **Làm bài thi**: countdown tính từ `started_at` (chống gian lận), đánh dấu câu đã làm/chưa làm, auto-save mỗi 20s, auto-submit khi hết giờ, chỉ xem kết quả sau nộp
- **Chấm điểm**: thang 10 theo trọng số câu, trắc nghiệm/điền đáp án; câu **Đúng/Sai 4 ý** chấm điểm bộ phận theo chuẩn Bộ GD-ĐT 2025 (đúng 4/4 → 1.0đ, 3/4 → 0.5đ, 2/4 → 0.25đ, ≤1/4 → 0đ)
- **Xem lại**: đúng/sai từng câu, đáp án đúng, lời giải chi tiết (KaTeX)
- **Lịch sử làm bài**: danh sách submission, điểm số, tiếp tục bài đang dở
- **Gamification**: nhận XP khi nộp bài, streak ngày liên tiếp (dựa trên `last_activity_at`), tự mở huy hiệu (Khởi đầu, Điểm 10, 100/500/1000 XP…), thông báo khi đạt huy hiệu
- **Thống kê cá nhân** (`/stats`): tổng quan (level/XP/streak/điểm TB/độ chính xác), biểu đồ điểm 30 ngày, chuyên đề yếu kèm gợi ý, danh sách huy hiệu đã đạt/chưa đạt
- **Bảng xếp hạng** (`/leaderboard`): top học viên theo tổng XP
- **Trang quản trị** (`/admin`, chỉ admin): dashboard tổng quan hệ thống, quản lý người dùng (đổi vai trò, khóa/mở khóa — user bị khóa không thể đăng nhập), duyệt/từ chối câu hỏi giáo viên đăng tải
- **Diễn đàn hỏi đáp** (`/forum`): đăng câu hỏi (gắn môn, hỗ trợ LaTeX), tìm kiếm/sắp xếp theo mới nhất - nổi bật, trả lời, upvote, tác giả chọn câu trả lời hay nhất (đánh dấu "đã giải"), xóa bài/bình luận (tác giả/admin)
- **Thông báo trong app**: chuông thông báo ở header, nhận thông báo mới khi có huy hiệu, bị từ chối câu hỏi, có bình luận mới trong bài viết hoặc được chọn câu trả lời hay nhất; đánh dấu đã đọc từng cái hoặc tất cả

## Scripts hữu ích

```bash
# Backend
cd backend
npm run db:migrate     # prisma migrate dev
npm run db:seed        # seed dữ liệu
npm run test:e2e       # 43 test integration (auth, câu hỏi, đề, chấm điểm, Đ/S 2025, gamification, stats, admin, forum)
npm run lint && npm run build

# Frontend
cd frontend
npm run lint           # ESLint
npx tsc --noEmit       # TypeScript check
npm run build          # production build
```

## Cấu trúc API chính

```
POST   /api/auth/register | login | refresh
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

## Giai đoạn sau (theo spec 12 tuần)

- Migrate PostgreSQL (đổi `provider` trong Prisma schema)
- OAuth Google, quên mật khẩu
- Deploy: Vercel + Railway/Render + Supabase