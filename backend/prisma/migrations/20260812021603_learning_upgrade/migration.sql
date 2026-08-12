-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "subject_id" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Note_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Note_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SubmissionAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submission_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "answer" TEXT,
    "is_correct" BOOLEAN,
    "score" REAL,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "SubmissionAnswer_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubmissionAnswer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SubmissionAnswer" ("answer", "id", "is_correct", "question_id", "score", "submission_id") SELECT "answer", "id", "is_correct", "question_id", "score", "submission_id" FROM "SubmissionAnswer";
DROP TABLE "SubmissionAnswer";
ALTER TABLE "new_SubmissionAnswer" RENAME TO "SubmissionAnswer";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
