-- OAuth Google + password reset

-- AlterTable (password_hash trở thành nullable để hỗ trợ user đăng nhập bằng Google)
ALTER TABLE "User" ALTER COLUMN "password_hash" DROP NOT NULL;

-- AlterTable (thêm google_id)
ALTER TABLE "User" ADD COLUMN "google_id" TEXT;

-- CreateIndex (unique google_id)
CREATE UNIQUE INDEX "User_google_id_key" ON "User"("google_id");

-- CreateTable (token đặt lại mật khẩu)
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PasswordResetToken_user_id_idx" ON "PasswordResetToken"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_hash_key" ON "PasswordResetToken"("token_hash");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
