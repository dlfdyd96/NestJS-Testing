import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Posts } from './entities/post.entity';

@Injectable()
export class PostService {
  private static readonly logger = new Logger(PostService.name);

  constructor(
    @InjectRepository(Posts)
    private readonly postRepository: Repository<Posts>,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Posts> {
    try {
      const result = await this.postRepository.save(createPostDto);
      PostService.logger.debug(result);
      return result;
    } catch (error) {
      PostService.logger.debug(error);
      throw error;
    }
  }

  async findAll(): Promise<Posts[]> {
    try {
      const posts = await this.postRepository.find();
      PostService.logger.debug(posts);
      return posts;
    } catch (error) {
      PostService.logger.debug(error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Posts> {
    try {
      const post = await this.postRepository.findOne({
        id,
      });
      PostService.logger.debug(post);
      return post;
    } catch (error) {
      PostService.logger.debug(error);
      throw error;
    }
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    try {
      const post = await this.postRepository.findOne({
        id,
      });
      if (!post) {
        throw new EntityNotFoundError(Posts, id);
      }
      PostService.logger.debug(post);
      const result = await this.postRepository.save({
        ...post,
        ...updatePostDto,
      });
      return result;
    } catch (error) {
      PostService.logger.debug(error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const post = await this.postRepository.findOne({
        id,
      });
      if (!post) {
        throw new EntityNotFoundError(Posts, id);
      }
      PostService.logger.debug(post);
      const result = await this.postRepository.softDelete({
        id,
      });
      return result;
    } catch (error) {
      PostService.logger.debug(error);
      throw error;
    }
  }
}
