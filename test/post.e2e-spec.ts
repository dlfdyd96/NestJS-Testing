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
