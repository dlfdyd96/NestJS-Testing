# NestJS Testing
## Index
- Testing
- Set up
  - Create New Project
  - Generate User Resource
  - installation
  - Setting up Project
- Unit Testing
  - install
  - Setting Up Tests
  - Unit Test
- Result
  - Test Coverage
- End-to-End(e2e) Testing
  - Setting Up

## Test Code?
최근 급하게 만들어야할 프로젝트가 생기면서 테스트 코드를 만들지 않고 진행하였습니다. 급하게 마무리가 되고 여러 이슈들이 발생하여 코드를 고치는 순간 다른부분에서 에러가 발생합니다. 이럴 때 정말 난처합니다. 😭

Application이 점점 커져갈수록, 수정사항도 많아집니다. 하지만 수정으로이한 부작용(Side-effect)가 발생하죠. **만약** 귀찮더라도 Test Code를 작성했더라면..? 에러가 어디에서 발생하는지 쉽게 Catch할 수 있을 것 이고, 디버깅 편리 및 유지보수가 편리해지는 등 코드에 대해 `유연한` 대처를 할 수 있습니다.

**Test Code**에 대한 자세한 내용은 [설마 아직도 테스트 코드를 작성 안 하시나요?](https://ssowonny.medium.com/%EC%84%A4%EB%A7%88-%EC%95%84%EC%A7%81%EB%8F%84-%ED%85%8C%EC%8A%A4%ED%8A%B8-%EC%BD%94%EB%93%9C%EB%A5%BC-%EC%9E%91%EC%84%B1-%EC%95%88-%ED%95%98%EC%8B%9C%EB%82%98%EC%9A%94-b54ec61ef91a) 글에서 참고하시면 좋을 것 같습니다.

이 프로젝트에서는 **실제 Database**와 연결하여 *게시글 CRUD* 작업을 해보는 `Unit Test`와 `End-to-end` Test를 진행해볼 예정입니다. 

<hr>

## Set up

### Create New Project

```
nest new nestjs-test
```

### Generate User Resource

```
nest generate resource post 
? What transport layer do you use? REST API
? Would you like to generate CRUD entry points? Yes
```

### installation

```
npm i @nestjs/config @nestjs/mapped-types @nestjs/typeorm typeorm mysql2 joi
npm i class-validator class-transformer
```

### Setting Up Project
#### Main.ts

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
```

#### App Module

```ts
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_PORT: Joi.string().required(),
        MYSQL_HOST: Joi.string().required(),
        MYSQL_PORT: Joi.string().required(),
        MYSQL_USERNAME: Joi.string().required(),
        MYSQL_PASSWORD: Joi.string().required(),
        MYSQL_DATABASE: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: +process.env.MYSQL_PORT,
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      synchronize: true,
      logging: true,
      entities: [Posts],
      charset: 'utf8mb4_unicode_ci',
      timezone: '+09:00',
    }),
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

#### Post Entity

```ts
@Entity({ name: 'post' })
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  contents: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @VersionColumn()
  version: number;
}
```

#### Post Module

```ts
@Module({
  imports: [TypeOrmModule.forFeature([Posts])],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
```

#### Post Controller

```ts
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
```

#### Post Service

```ts
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
```

<hr>

## Unit Testing

### install

Install `Jest` Testing Tool package.

```
npm i --save-dev @nestjs/testing

rm ./src/post/post.controller.spec.ts    // controller test는 나중에 진행하기 위함합니다.
```

### Setting Up Tests

NestJS의 Testing Tool은 `Jest` 입니다. 기본적으로 제공하고 있기 때문에 `npm run test`를 하면 Nest가 `.spec` 등 test 파일들을 자동으로 검사하여 Test를 진행합니다.

#### Error!

하지만 `npm run test`하면 Error가 나옵니다.

```sh
Cannot find module 'src/jwt/jwt.service' from 'users/users.service.ts'
```

Testing Tool(Jest)이 src 경로를 찾지 못하는 경우입니다. 우리는 TypeScript를 사용하고 있기 때문에 `../../`이런 식으로 쓸 필요가 없습니다. 하지만 `Jest`는 그렇지 못합니다 👶.

#### Solve

`packge.json`에서 Jest가 파일을 찾는 방식을 수정합니다.

```json
{
  // ...
  "jest": {
    // ...
    "moduleNameMapper": {
      "^src/(.*)$": "<rootDir>/$1"
    }
  }
}
```

#### Error또 발생!

```sh
$ npm run test

FAIL  src/post/post.service.spec.ts (7.18 s)
● PostService › should be defined

  Nest can't resolve dependencies of the PostService (?). Please make sure that the argument PostsRepository at index [0] is available in the RootTestModule context.

  Potential solutions:
  - If PostsRepository is a provider, is it part of the current RootTestModule?
  - If PostsRepository is exported from a separate @Module, is that module imported within RootTestModule?
    @Module({
      imports: [ /* the Module containing PostsRepository */ ]
    })
```

이게 무슨말이면, PostService는 repository가 필요한데, test Module에서 repository를 제공하지 않아 생기는 문제입니다.

그렇다고 TypeORM Module의 Repository를 제공하지 않습니다. 저희는 **Mock Repository**를 제공할 것 입니다.

Mock에 대해서 모르신다면 밑에 참고 게시글을 꼭 참고하세요.

> **Mock 🔍**
>
> 참고사이트: [Mock이란? - 人 CoDOM](http://www.incodom.kr/Mock)

#### Solve

- post.service.spec.ts

```ts
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
});
```

> **`MockRepository` 🔍**
>
> ```ts
> type MockRepository<T = any> = Partial<
>   Record<keyof Repository<T>, jest.Mock>
> >;
> ```
>
> Repository를 Mocking 하기위해 Repository Type을 정의한 것
>
> 1. `Partial` : 타입 T의 모든 요소를 optional하게 한다.
> 2. `Record` : 타입 T의 모든 K의 집합으로 타입을 만들어준다.
> 3. `keyof Repository<T>` : Repository의 모든 method key를 불러온다.
> 4. `jest.Mock` : 3번의 key들을 다 가짜로 만들어준다.
> 5. `type MockRepository<T = any>` : 이를 type으로 정의해준다.

- Result

```sh
PASS  src/post/post.service.spec.ts
PostService
  ✓ should be defined (12 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.729 s, estimated 5 s
Ran all test suites related to changed files.

Watch Usage: Press w to show more.

```

### Unit Test

Unit Test는 코드의 **각 줄**에 문제가 있나 없나를 검사합니다. (이 함수가 제대로 동작하냐 안하냐는 e2e에 가깝습니다.)

Unit Test는 우리가 의도한대로

1. 잘 작동되는지 테스트를 확인하고,
2. 원하는 출력물이 나오며,
3. 고립된 결과를

원합니다.

#### Test `create()` method

- post.service.spec.ts

```ts
// ...

describe('PostService', () => {
  // ...
  describe('create()', () => {
    it.todo('should fail on exception');
    it.todo('should create Posts');
  });
});
```

여기서 `describe('create()', () => {...})` 는 테스트할 `create()` method의 큰 범주라고 생각하시면 됩니다.

`it.todo(...)`는 모든 경우의 수에 대해 test를 하는 것이고 `todo()` 는 test를 나중에 만들거라고 jest에게 알려줍니다.

- result

```
PASS  src/post/post.service.spec.ts (5.055 s)
  PostService
    ✓ should be defined (14 ms)
    create()
      ✎ todo should fail on exception
      ✎ todo should create Posts

Test Suites: 1 passed, 1 total
Tests:       2 todo, 1 passed, 3 total
Snapshots:   0 total
Time:        5.315 s
Ran all test suites related to changed files.

Watch Usage: Press w to show more.
```

- post.service.spec.ts

```ts
describe('PostService', () => {
  describe('create()', () => {
    const createArgs = {
      title: '제목',
      contents: '글',
    };
    it('should fail on exception', async () => {
      // postRepository.save() error 발생
      postRepository.save.mockRejectedValue('save error'); // 실패할꺼라고 가정한다.
      const result = await service.create(createArgs);
      expect(result).toEqual('save error'); // 진짜 에러 발생했넴
    });

    it('should create Posts', async () => {
      postRepository.save.mockResolvedValue(createArgs); // 성공할꺼라고 가정한다.
      const result = await service.create(createArgs); //

      expect(postRepository.save).toHaveBeenCalledTimes(1); // save가 1번 불러졌니?
      expect(postRepository.save).toHaveBeenCalledWith(createArgs); // 매개변수로 createArgs가 주어졌니?

      expect(result).toEqual(createArgs); // 이 create() method의 결과가 `createArgs`와 똑같니?
    });
  });
});
```

- result

```
PASS  src/post/post.service.spec.ts
  PostService
    ✓ should be defined (11 ms)
    create()
      ✓ should fail on exception (19 ms)
      ✓ should create Posts (9 ms)

[Nest] 38755   - 2021. 03. 05. 오후 6:16:19   [PostService] Object:
{
  "title": "제목",
  "contents": "글"
}

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        4.761 s
```

#### Test `findAll()` method
```ts
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

```

#### Test `findOne()` method
```ts
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
```

#### Test `update()` method
```ts
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
```

#### Test `remove()` method
```ts
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
```

<hr>

## Result

### Test Coverage
```sh
npm run test:cov

---------------------|---------|----------|---------|---------|-------------------
File                 | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------------|---------|----------|---------|---------|-------------------
All files            |   58.33 |      100 |   56.25 |   58.49 |                   
 src                 |   41.94 |      100 |      75 |      36 |                   
  app.controller.ts  |     100 |      100 |     100 |     100 |                   
  app.module.ts      |       0 |      100 |     100 |       0 | 1-42              
  app.service.ts     |     100 |      100 |     100 |     100 |                   
  main.ts            |       0 |      100 |       0 |       0 | 1-18
 src/post            |   63.89 |      100 |      50 |   66.67 | 
  post.controller.ts |       0 |      100 |       0 |       0 | 1-40
  post.module.ts     |       0 |      100 |     100 |       0 | 1-12
  post.service.ts    |     100 |      100 |     100 |     100 | 
  # post.service.ts 가 coverage 100% 를 달성했습니다! 👏👏👏
 src/post/dto        |       0 |      100 |     100 |       0 | 
  create-post.dto.ts |       0 |      100 |     100 |       0 | 1-4
  update-post.dto.ts |       0 |      100 |     100 |       0 | 1-4
 src/post/entities   |     100 |      100 |     100 |     100 |
  post.entity.ts     |     100 |      100 |     100 |     100 |
---------------------|---------|----------|---------|---------|-------------------
Test Suites: 1 failed, 1 passed, 2 total
Tests:       1 failed, 16 passed, 17 total
Snapshots:   0 total
Time:        8.027 s
Ran all test suites.
```

coverage 로 부터 Unit Test의 어떤 부분이 Test가 빠졌는지 확인이 가능합니다. 

100%를 다 채우면 **기분이 너무 좋습니다.** ~~(INTJ)~~

<hr>

## End-to-End(e2e) Testing
(공사중 🛠)

### Setting up
- project RootDir의 `test/post.e2e-spec.ts` 를 만들어줍니다.
```ts
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { getConnection } from 'typeorm';

describe('PostController (e2e)', () => {
  let app: INestApplication;

  // Test 전
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
  });

  // Test 후
  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('create', () => {
    it.todo('should create Post');
  });
  describe('findAll', () => {
    it.todo('should findAll Posts');
  });
  describe('findOne', () => {
    it.todo('should findOne Post.');
  });
  describe('update', () => {
    it.todo('should update Post.');
  });
  describe('remove', () => {
    it.todo('should remove Post.');
  });
});

```