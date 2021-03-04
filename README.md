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

## Unit Testing

### install

Install `Jest` Testing Tool package.

```
npm i --save-dev @nestjs/testing
```
