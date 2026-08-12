import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import {
  ListPostsDto,
  CreatePostDto,
  UpdatePostDto,
  CreateCommentDto,
} from './dto/forum.dto';
import { CurrentUser } from '../users/decorators';

@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Get('posts')
  list(@CurrentUser('sub') userId: string, @Query() query: ListPostsDto) {
    return this.forumService.list(userId, query);
  }

  @Post('posts')
  create(@CurrentUser('sub') userId: string, @Body() dto: CreatePostDto) {
    return this.forumService.create(userId, dto);
  }

  @Get('posts/:id')
  findOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.forumService.findOne(userId, id);
  }

  @Patch('posts/:id')
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.forumService.update(userId, id, dto);
  }

  @Delete('posts/:id')
  remove(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') id: string,
  ) {
    return this.forumService.remove(userId, role, id);
  }

  @Post('posts/:id/vote')
  vote(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.forumService.vote(userId, id);
  }

  @Post('posts/:id/comments')
  addComment(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.forumService.addComment(userId, id, dto);
  }

  @Patch('posts/:id/best/:commentId')
  markBest(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Param('commentId') commentId: string,
  ) {
    return this.forumService.markBest(userId, id, commentId);
  }

  @Delete('posts/:id/comments/:commentId')
  removeComment(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') id: string,
    @Param('commentId') commentId: string,
  ) {
    return this.forumService.removeComment(userId, role, id, commentId);
  }
}
