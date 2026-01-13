import { Note } from "../entities/note.entity";
import { v4 as uuidv4 } from 'uuid';

export class NoteFactory {
    static create(title: string, content: string): Note {
        const now = new Date();
        return {
            id: uuidv4(),
            title,
            content,
            createdAt: now,
            updatedAt: now
        };
    }
}
