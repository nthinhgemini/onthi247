import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubjectsModule } from './subjects/subjects.module';
import { QuestionsModule } from './questions/questions.module';
import { ExamsModule } from './exams/exams.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { StatsModule } from './stats/stats.module';
import { AdminModule } from './admin/admin.module';
import { ForumModule } from './forum/forum.module';
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    SubjectsModule,
    QuestionsModule,
    ExamsModule,
    SubmissionsModule,
    StatsModule,
    AdminModule,
    ForumModule,
    NotesModule,
  ],
})
export class AppModule {}
