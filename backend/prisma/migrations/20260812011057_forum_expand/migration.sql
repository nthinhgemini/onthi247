/*
  Warnings:

  - Added the required column `updated_at` to the `ForumPost` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "ForumVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForumVote_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "ForumPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ForumVote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ForumComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_best" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForumComment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "ForumPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ForumComment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ForumComment" ("content", "created_at", "id", "post_id", "user_id") SELECT "content", "created_at", "id", "post_id", "user_id" FROM "ForumComment";
DROP TABLE "ForumComment";
ALTER TABLE "new_ForumComment" RENAME TO "ForumComment";
CREATE TABLE "new_ForumPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "subject_id" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "vote_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "best_comment_id" TEXT,
    CONSTRAINT "ForumPost_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ForumPost_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ForumPost_best_comment_id_fkey" FOREIGN KEY ("best_comment_id") REFERENCES "ForumComment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ForumPost" ("content", "created_at", "id", "subject_id", "title", "user_id") SELECT "content", "created_at", "id", "subject_id", "title", "user_id" FROM "ForumPost";
DROP TABLE "ForumPost";
ALTER TABLE "new_ForumPost" RENAME TO "ForumPost";
CREATE UNIQUE INDEX "ForumPost_best_comment_id_key" ON "ForumPost"("best_comment_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ForumVote_post_id_user_id_key" ON "ForumVote"("post_id", "user_id");
