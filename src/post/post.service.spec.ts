import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Posts } from './entities/post.entity';
import { PostService } from './post.service';

const mockPostRepository = () => ({
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  softDelete: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('PostService', () => {
  let service: PostService;
  let postRepository: MockRepository<Posts>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(Posts),
          useValue: mockPostRepository(),
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    postRepository = module.get<MockRepository<Posts>>(
      getRepositoryToken(Posts),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    const createArgs = {
      title: '제목',
      contents: '글',
    };
    it('should fail on exception', async () => {
      postRepository.save.mockRejectedValue('save error');
      const result = await service.create(createArgs);
      expect(result).toEqual('save error');
    });

    it('should create Posts', async () => {
      postRepository.save.mockResolvedValue(createArgs);
      const result = await service.create(createArgs);

      expect(postRepository.save).toHaveBeenCalledTimes(1);
      expect(postRepository.save).toHaveBeenCalledWith(createArgs);

      expect(result).toEqual(createArgs);
    });
  });

  describe('findAll()', () => {
    it('should be find All', async () => {
      postRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(postRepository.find).toHaveBeenCalledTimes(1);

      expect(result).toEqual([]);
    });
    it('should fail on exception', async () => {
      postRepository.find.mockRejectedValue('find error');
      const result = await service.findAll();
      expect(result).toEqual('find error');
    });
  });

  describe('findOne()', () => {
    it('should be findOne', async () => {});
    it.todo('should fail if no post is found');
    it.todo('should fail on update exception');
  });

  describe('update()', () => {
    it.todo('should be update post');
    it.todo('should fail if no post is found');
    it.todo('should fail on exception');
  });

  describe('remove()', () => {
    it.todo('should be remove post');
    it.todo('should fail if no post is found');
    it.todo('should fail on softDelete exception');
  });
});
