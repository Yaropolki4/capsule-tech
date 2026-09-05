import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { PostService } from './post.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { AccessTokenPayload } from 'src/auth/types/access-token-payload';
import { ZodValidationPipe } from 'src/shared/validation/zod-validation.pipe';
import {
  createPostRequestDtoSchema,
  CreatePostRequestDto,
  CreatePostResponseDto,
  getPostsFeedRequestDtoSchema,
  GetPostsFeedRequestDto,
  GetPostsFeedResponseDto,
  LikePostResponseDto,
} from '@capsule/common';

@Controller('post')
@UseGuards(JwtGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createPostRequestDtoSchema))
    body: CreatePostRequestDto,
    @Req() req: Request,
  ): Promise<CreatePostResponseDto> {
    const user = req.user as AccessTokenPayload;
    const post = await this.postService.create(body, user.id);

    return {
      id: post.id,
      text: post.text ?? undefined,
      createdById: post.createdById,
      capsuleId: post.capsuleId ?? undefined,
      clothesId: post.clothesId ?? undefined,
      createdAt: post.createdAt.toISOString(),
    };
  }

  @Get('wall')
  async getFeed(
    @Query(new ZodValidationPipe(getPostsFeedRequestDtoSchema))
    { cursor, limit, userId }: GetPostsFeedRequestDto,
    @Req() req: Request,
  ): Promise<GetPostsFeedResponseDto> {
    const currentUser = req.user as AccessTokenPayload;
    const feed = await this.postService.getFeed(
      cursor,
      limit,
      currentUser.id,
      userId,
    );

    return {
      items: feed.items.map((post) => ({
        id: post.id,
        text: post.text ?? undefined,
        createdAt: post.createdAt.toISOString(),
        createdBy: {
          id: post.createdBy.id,
          name: post.createdBy.name,
          avatarUrl: post.createdBy.avatarUrl ?? undefined,
        },
        capsule: post.capsule
          ? {
              id: post.capsule.id,
              name: post.capsule.name ?? undefined,
              thumbnailUrl: post.capsule.thumbnailUrl,
            }
          : undefined,
        clothes: post.clothes
          ? {
              id: post.clothes.id,
              imageUrl: post.clothes.imageUrl,
              brand: post.clothes.brand,
              category: post.clothes.category,
            }
          : undefined,
        likesCount: post.likesCount,
        isLikedByMe: post.likes.length > 0,
      })),
      nextCursor: feed.nextCursor,
    };
  }

  @Post(':id/like')
  async like(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<LikePostResponseDto> {
    const user = req.user as AccessTokenPayload;

    return this.postService.like(id, user.id);
  }

  @Delete(':id/like')
  async unlike(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<LikePostResponseDto> {
    const user = req.user as AccessTokenPayload;

    return this.postService.unlike(id, user.id);
  }
}
