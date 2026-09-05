import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostRepository } from './post.repository';
import { CreatePostRequestDto } from '@capsule/common';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async create(dto: CreatePostRequestDto, userId: string) {
    if (dto.capsuleId) {
      const capsule = await this.postRepository.findCapsuleOwnedBy(
        userId,
        dto.capsuleId,
      );

      if (!capsule) {
        throw new BadRequestException('Капсула вам не принадлежит');
      }
    }

    if (dto.clothesId) {
      const clothes = await this.postRepository.findClothesOwnedBy(
        userId,
        dto.clothesId,
      );

      if (!clothes) {
        throw new BadRequestException('Вещь вам не принадлежит');
      }
    }

    return this.postRepository.create({
      text: dto.text,
      createdById: userId,
      capsuleId: dto.capsuleId,
      clothesId: dto.clothesId,
    });
  }

  async getFeed(
    cursor: string | undefined,
    limit: number,
    viewerId: string,
    authorId?: string,
  ) {
    const rows = await this.postRepository.getFeed(
      cursor,
      limit,
      viewerId,
      authorId,
    );

    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;

    return {
      items,
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    };
  }

  async like(postId: string, userId: string) {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundException('Пост не найден');
    }

    const existingLike = await this.postRepository.getLike(postId, userId);

    if (existingLike) {
      throw new BadRequestException('Пост уже лайкнут');
    }

    const updated = await this.postRepository.likePost(postId, userId);

    return { likesCount: updated.likesCount, isLikedByMe: true };
  }

  async unlike(postId: string, userId: string) {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundException('Пост не найден');
    }

    const existingLike = await this.postRepository.getLike(postId, userId);

    if (!existingLike) {
      throw new BadRequestException('Пост не лайкнут');
    }

    const updated = await this.postRepository.unlikePost(postId, userId);

    return { likesCount: updated.likesCount, isLikedByMe: false };
  }
}
