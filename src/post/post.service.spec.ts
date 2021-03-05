import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { object } from 'joi';
import { EntityNotFoundError, Repository, UpdateResult } from 'typeorm';
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
    const findOneArgs = { id: '1' };

    it('should be findOne', async () => {
      const mockedPost = {
        id: '1',
        title: '음',
        description: '힘드노',
      };
      postRepository.findOne.mockResolvedValue(mockedPost);

      const result = await service.findOne(findOneArgs.id);

      expect(postRepository.findOne).toHaveBeenCalledTimes(1);
      expect(postRepository.findOne).toHaveBeenCalledWith(findOneArgs);

      expect(result).toEqual(mockedPost);
    });
    it('should fail if no post is found', async () => {
      postRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(findOneArgs.id);

      expect(postRepository.findOne).toHaveBeenCalledTimes(1);
      expect(postRepository.findOne).toHaveBeenCalledWith(findOneArgs);

      expect(result).toEqual(new EntityNotFoundError(Posts, findOneArgs.id));
    });
    it('should fail on findOne exception', async () => {
      postRepository.findOne.mockRejectedValue('find error');
      const result = await service.findOne(findOneArgs.id);
      expect(result).toEqual('find error');
    });
  });

  describe('update()', () => {
    const findOneArgs = { id: '1' };
    const updateArgs = {
      title: 'new',
    };

    it('should be update post', async () => {
      const oldPosts = {
        id: '1',
        title: 'old',
        description: 'description',
      };
      const newPosts = {
        id: '1',
        title: 'new',
        description: 'description',
      };

      postRepository.findOne.mockResolvedValue(oldPosts);
      postRepository.save.mockResolvedValue(newPosts);

      const result = await service.update(findOneArgs.id, updateArgs);

      expect(postRepository.findOne).toHaveBeenCalledTimes(1);
      expect(postRepository.findOne).toHaveBeenCalledWith(findOneArgs);

      expect(postRepository.save).toHaveBeenCalledTimes(1);
      expect(postRepository.save).toHaveBeenCalledWith({
        ...oldPosts,
        ...updateArgs,
      });

      expect(result).toEqual(newPosts);
    });
    it('should fail if no post is found', async () => {
      postRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(findOneArgs.id);

      expect(postRepository.findOne).toHaveBeenCalledTimes(1);
      expect(postRepository.findOne).toHaveBeenCalledWith(findOneArgs);

      expect(result).toEqual(new EntityNotFoundError(Posts, findOneArgs.id));
    });
    it('should fail on findOne exception', async () => {
      postRepository.findOne.mockRejectedValue('find error');
      const result = await service.findOne(findOneArgs.id);
      expect(result).toEqual('find error');
    });
    it('should fail on save exception', async () => {
      postRepository.save.mockResolvedValue('find error');
      const result = await service.update(findOneArgs.id, updateArgs);
      expect(result).toEqual('find error');
    });
  });

  describe('remove()', () => {
    const removeArgs = '1';
    const findOneArgs = { id: '1' };
    const softDeleteArgs = { id: '1' };

    it('should be remove post', async () => {
      postRepository.findOne.mockResolvedValue(findOneArgs);
      postRepository.softDelete.mockResolvedValue(softDeleteArgs);

      await service.remove(removeArgs);

      expect(postRepository.findOne).toHaveBeenCalledTimes(1);
      expect(postRepository.findOne).toHaveBeenCalledWith(findOneArgs);

      expect(postRepository.softDelete).toHaveBeenCalledTimes(1);
      expect(postRepository.softDelete).toHaveBeenCalledWith(softDeleteArgs);
    });

    it('should fail if no post is found', async () => {
      postRepository.findOne.mockResolvedValue(null);

      const result = await service.remove(findOneArgs.id);

      expect(postRepository.findOne).toHaveBeenCalledTimes(1);
      expect(postRepository.findOne).toHaveBeenCalledWith(findOneArgs);

      expect(result).toEqual(new EntityNotFoundError(Posts, findOneArgs.id));
    });
    it('should fail on findOne exception', async () => {
      postRepository.findOne.mockRejectedValue('find error');
      const result = await service.findOne(findOneArgs.id);
      expect(result).toEqual('find error');
    });
    it('should fail on remove exception', async () => {
      postRepository.findOne.mockRejectedValue('remove error');
      const result = await service.findOne(findOneArgs.id);
      expect(result).toEqual('remove error');
    });
  });
});
