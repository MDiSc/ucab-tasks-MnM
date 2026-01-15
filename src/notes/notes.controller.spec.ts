import { Test, TestingModule } from '@nestjs/testing';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { NoteResponseDto } from './dto/note-response.dto';
import { NoteSummaryDto } from './dto/note-summary.dto';

describe('NotesController', () => {
    let controller: NotesController;
    let serviceMock: any;

    const mockNote: NoteResponseDto = {
        id: 'test-id',
        title: 'Test Note',
        content: 'Test Content',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockSummary: NoteSummaryDto = {
        id: 'test-id',
        title: 'Test Note',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        serviceMock = {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [NotesController],
            providers: [
                {
                    provide: NotesService,
                    useValue: serviceMock,
                },
            ],
        }).compile();

        controller = module.get<NotesController>(NotesController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return array of summaries', async () => {
            serviceMock.findAll.mockResolvedValue([mockSummary]);
            const result = await controller.findAll();
            expect(result).toBeInstanceOf(Array);
            expect(result[0]).toEqual(mockSummary);
            expect(serviceMock.findAll).toHaveBeenCalled();
        });

        it('should pass query params', async () => {
            serviceMock.findAll.mockResolvedValue([]);
            await controller.findAll('search', 'title', 'asc');
            expect(serviceMock.findAll).toHaveBeenCalledWith({
                search: 'search',
                sortBy: 'title',
                order: 'asc',
            });
        });
    });

    describe('findOne', () => {
        it('should return a single note', async () => {
            serviceMock.findById.mockResolvedValue(mockNote);
            const result = await controller.findOne('test-id');
            expect(result).toEqual(mockNote);
            expect(serviceMock.findById).toHaveBeenCalledWith('test-id');
        });
    });

    describe('create', () => {
        it('should create a note', async () => {
            serviceMock.create.mockResolvedValue(mockNote);
            const dto = { title: 'T', content: 'C' };
            const result = await controller.create(dto);
            expect(result).toEqual(mockNote);
            expect(serviceMock.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('update', () => {
        it('should update a note', async () => {
            serviceMock.update.mockResolvedValue(mockNote);
            const dto = { title: 'Updated' };
            const result = await controller.update('test-id', dto);
            expect(result).toEqual(mockNote);
            expect(serviceMock.update).toHaveBeenCalledWith('test-id', dto);
        });
    });

    describe('delete', () => {
        it('should delete notes', async () => {
            serviceMock.delete.mockResolvedValue(1);
            const dto = { ids: ['test-id'] };
            const result = await controller.delete(dto);
            expect(result).toEqual({ removed: 1 });
            expect(serviceMock.delete).toHaveBeenCalledWith(['test-id']);
        });
    });
});
