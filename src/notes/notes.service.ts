import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INotesRepository, NOTES_REPOSITORY } from './repositories/notes.repository.interface';
import { Note } from './entities/note.entity';
import { NoteFactory } from './factories/note.factory';

/**
 * * Se encarga de coordinar las operaciones entre el controlador y el repositorio.
 */
@Injectable()
export class NotesService {
  /**
   * Inicializa el servicio inyectando el repositorio de datos.
   * * @param notesRepo - Implementación del repositorio.
   */
  constructor(
    @Inject(NOTES_REPOSITORY) private readonly notesRepo: INotesRepository,
  ) {}

  /**
   * Crea una nueva nota aplicando la fábrica de objetos.
   * * @param title - Título de la nota.
   * @param content - Contenido de la nota.
   * @returns La nota creada con ID único y fechas generadas.
   */
  async create(title: string, content: string): Promise<Note> {
    const newNote = NoteFactory.create(title, content);
    return await this.notesRepo.create(newNote);
  }

  /**
   * Obtiene el listado general de notas.
   * Aplica lógica de ordenamiento según lo requerido por el cliente.
   * * @param sortBy - Criterio de ordenamiento opcional ('title', 'createdAt', 'updatedAt').
   * @returns Lista de notas (el controlador se encargará de ocultar el contenido).
   */
  async findAll(sortBy?: 'title' | 'createdAt' | 'updatedAt'): Promise<Note[]> {
    const notes = await this.notesRepo.findAll();

    if (sortBy) {
      notes.sort((a, b) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title); 
        }
        const dateA = new Date(a[sortBy]).getTime();
        const dateB = new Date(b[sortBy]).getTime();
        return dateB - dateA;
      });
    }

    return notes;
  }

  /**
   * Busca una nota específica por su ID.
   * * @param id - Identificador único de la nota.
   * @returns La nota completa.
   * @throws {NotFoundException} Si la nota no existe (retorna 404).
   */
  async findOne(id: string): Promise<Note> {
    const note = await this.notesRepo.findById(id);
    if (!note) {
      throw new NotFoundException(`Nota con ID ${id} no encontrada`);
    }
    return note;
  }

  /**
   * Actualiza una nota existente.
   * * @param id - ID de la nota a modificar.
   * @param title - Nuevo título (opcional).
   * @param content - Nuevo contenido (opcional).
   * @returns La nota actualizada.
   */
  async update(id: string, title?: string, content?: string): Promise<Note> {
    const note = await this.findOne(id);
    if (title) note.title = title;
    if (content) note.content = content;
    note.updatedAt = new Date();
    return await this.notesRepo.update(note);
  }

  /**
   * Elimina una o varias notas del sistema.
   * * @param ids - Arreglo de IDs a eliminar.
   * @returns Cantidad de notas eliminadas.
   */
  async remove(ids: string[]): Promise<number> {
    // Delegamos la eliminación múltiple al repositorio optimizado
    return await this.notesRepo.delete(ids);
  }
}