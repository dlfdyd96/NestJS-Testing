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
npm i @nestjs/config @nestjs/mapped-types @nestjs/typeorm typeorm mysql2
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

### Post Controller

```ts

```

### Post Service

```ts

```

## Unit Testing

### install

Install `Jest` Testing Tool package.

```
npm i --save-dev @nestjs/testing
```
