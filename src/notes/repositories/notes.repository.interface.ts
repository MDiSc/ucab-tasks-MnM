    import { Note } from '../entities/note.entity';

    export interface INotesRepository {
  /**
   * Obtiene todas las notas almacenadas.
   * @returns Una promesa con un arreglo de objetos Note.
   */
  findAll(): Promise<Note[]>;

  /**
   * Busca una nota específica por su ID único.
   * @param id - El identificador único de la nota (UUID).
   * @returns Una promesa con la Nota encontrada o null si no existe.
   */
  findById(id: string): Promise<Note | null>;

  /**
   * Guarda una nueva nota en el almacenamiento.
   * @param note - La entidad Note completa que se va a guardar.
   * @returns Una promesa con la nota guardada.
   */
  create(note: Note): Promise<Note>;

  /**
   * Actualiza una nota existente.
   * @param note - La nota con los datos actualizados.
   * @returns Una promesa con la nota actualizada.
   */
  update(note: Note): Promise<Note>;

  /**
   * Elimina una nota del almacenamiento.
   * @param id - El identificador de la nota a borrar.
   * @returns Una promesa vacía (void) cuando termina.
   */
  delete(id: string): Promise<void>;
}

/**
 * Token de inyección para el repositorio de notas.
 * Se usa en el decorador @Inject() para que NestJS sepa qué implementación usar.
 */
export const NOTES_REPOSITORY = 'NOTES_REPOSITORY';