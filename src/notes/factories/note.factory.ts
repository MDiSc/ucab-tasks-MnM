import { Note } from "../entities/note.entity";
import { v4 as uuidv4 } from 'uuid';

/**
 * Fábrica para la creación de instancias de entidad Note.
 * Encapsula la lógica de generación de IDs y fechas iniciales.
 */
export class NoteFactory {
    /**
     * Crea una nueva nota con ID único y fechas actuales.
     * @param title - Título de la nota.
     * @param content - Contenido de la nota.
     * @returns {Note} La nueva instancia de la nota.
     */
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
