import { OmitType, PartialType, PickType } from '@nestjs/mapped-types';
import { Posts } from '../entities/post.entity';

export type AllowPostType = keyof 'title' | 'contents';

export class CreatePostDto extends PickType(Posts, [
  'contents',
  'title',
] as const) {}
