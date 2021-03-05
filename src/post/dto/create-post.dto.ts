import { PickType } from '@nestjs/mapped-types';
import { Posts } from '../entities/post.entity';

export class CreatePostDto extends PickType(Posts, [
  'contents',
  'title',
] as const) {}
