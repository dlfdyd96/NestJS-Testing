# NestJS Testing

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

### Main.ts

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

### App Module

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

### Post Entity

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

### Post Module

```ts
@Module({
  imports: [TypeOrmModule.forFeature([Posts])],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
```

### Post Controller

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

### Post Service

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

##### Error또 발생!

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

#### Test `findOne()` method

#### Test `update()` method

#### Test `remove()` method
