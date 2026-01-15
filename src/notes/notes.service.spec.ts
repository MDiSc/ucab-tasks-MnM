import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { NOTES_REPOSITORY_TOKEN } from './repositories/notes.repository.interface';
import { Note } from './entities/note.entity';
import { NotFoundException } from '@nestjs/common';

describe('NotesService', () => {
    let service: NotesService;
    let repositoryMock: any;

    const mockNote: Note = {
        id: 'test-id',
        title: 'Test Note',
        content: 'Test Content',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        repositoryMock = {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotesService,
                {
                    provide: NOTES_REPOSITORY_TOKEN,
                    useValue: repositoryMock,
                },
            ],
        }).compile();

        service = module.get<NotesService>(NotesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of note summaries', async () => {
            repositoryMock.findAll.mockResolvedValue([mockNote]);
            const result = await service.findAll();
            expect(result).toEqual([
                {
                    id: mockNote.id,
                    title: mockNote.title,
                    createdAt: mockNote.createdAt,
                    updatedAt: mockNote.updatedAt,
                },
            ]);
            expect(repositoryMock.findAll).toHaveBeenCalled();
        });

        it('should filter by search text', async () => {
            repositoryMock.findAll.mockResolvedValue([mockNote]);
            const result = await service.findAll({ search: 'Test' });
            expect(result).toHaveLength(1);
        });

        it('should return empty if search does not match', async () => {
            repositoryMock.findAll.mockResolvedValue([mockNote]);
            const result = await service.findAll({ search: 'NonExistent' });
            expect(result).toHaveLength(0);
        });

        it('should sort by field', async () => {
            const noteA = { ...mockNote, id: 'a', title: 'A' };
            const noteB = { ...mockNote, id: 'b', title: 'B' };
            repositoryMock.findAll.mockResolvedValue([noteB, noteA]);

            const result = await service.findAll({ sortBy: 'title', order: 'asc' });
            expect(result[0].title).toBe('A');
            expect(result[1].title).toBe('B');
        });
    });

    describe('findById', () => {
        it('should return a single note complete', async () => {
            repositoryMock.findById.mockResolvedValue(mockNote);
            const result = await service.findById('test-id');
            expect(result).toEqual({
                id: mockNote.id,
                title: mockNote.title,
                content: mockNote.content,
                createdAt: mockNote.createdAt,
                updatedAt: mockNote.updatedAt,
            });
        });

        it('should throw NotFoundException if note not found', async () => {
            repositoryMock.findById.mockResolvedValue(null);
            await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('should create and return a new note', async () => {
            repositoryMock.create.mockImplementation((note) => Promise.resolve(note));
            const dto = { title: 'New', content: 'Content' };
            const result = await service.create(dto);
            expect(result).toHaveProperty('id');
            expect(result.title).toBe(dto.title);
            expect(result.content).toBe(dto.content);
            expect(repositoryMock.create).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should update a note and return it', async () => {
            repositoryMock.findById.mockResolvedValue(mockNote);
            repositoryMock.update.mockImplementation((note) => Promise.resolve(note));

            const updateDto = { title: 'Updated' };
            const result = await service.update('test-id', updateDto);

            expect(result.title).toBe('Updated');
            expect(repositoryMock.update).toHaveBeenCalled();
        });

        it('should throw NotFoundException if note to update does not exist', async () => {
            repositoryMock.findById.mockResolvedValue(null);
            await expect(service.update('bad-id', {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete notes and return count', async () => {
            repositoryMock.delete.mockResolvedValue(1);
            const count = await service.delete(['test-id']);
            expect(count).toBe(1);
            expect(repositoryMock.delete).toHaveBeenCalledWith(['test-id']);
        });
    });
});
