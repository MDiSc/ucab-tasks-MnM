import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Notes (e2e)', () => {
    let app: INestApplication;
    let createdId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/notes (POST) - should create a note', async () => {
        const response = await request(app.getHttpServer())
            .post('/notes')
            .send({ title: 'E2E Title', content: 'E2E Content' })
            .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('E2E Title');
        createdId = response.body.id;
    });

    it('/notes (GET) - should list notes', async () => {
        const response = await request(app.getHttpServer())
            .get('/notes')
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        const found = response.body.find((n) => n.id === createdId);
        expect(found).toBeDefined();
        // Summary keys check
        expect(found).not.toHaveProperty('content');
    });

    it('/notes/:id (GET) - should return one note', async () => {
        const response = await request(app.getHttpServer())
            .get(`/notes/${createdId}`)
            .expect(200);

        expect(response.body.id).toBe(createdId);
        expect(response.body.content).toBe('E2E Content');
    });

    it('/notes/:id (PATCH) - should update a note', async () => {
        // Wait a bit to ensure updatedAt differs changes
        await new Promise((r) => setTimeout(r, 100));

        const response = await request(app.getHttpServer())
            .patch(`/notes/${createdId}`)
            .send({ title: 'E2E Updated' })
            .expect(200);

        expect(response.body.title).toBe('E2E Updated');
        expect(response.body.updatedAt).not.toBe(response.body.createdAt);
    });

    it('/notes (DELETE) - should delete the note', async () => {
        const response = await request(app.getHttpServer())
            .delete('/notes')
            .send({ ids: [createdId] })
            .expect(200);

        expect(response.body.removed).toBe(1);
    });

    it('/notes/:id (GET) - should not find deleted note', async () => {
        await request(app.getHttpServer())
            .get(`/notes/${createdId}`)
            .expect(404);
    });
});
