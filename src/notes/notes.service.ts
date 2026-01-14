import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NOTES_REPOSITORY_TOKEN } from './repositories/notes.repository.interface';
import type { INotesRepository } from './repositories/notes.repository.interface';
import { NoteFactory } from './factories/note.factory';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { Note } from './entities/note.entity';
import { NoteSummaryDto } from './dto/note-summary.dto'; // ✅ Corregido (sin .js)

/**
 * Servicio de Notas (Facade).
 * Encapsula las reglas de negocio de la aplicación y actúa como intermediario
 * entre los controladores y la capa de persistencia (repositorio).
 */
@Injectable()
export class NotesService {
  /**
   * Inicializa el servicio inyectando la dependencia del repositorio.
   * @param notesRepo - Implementación concreta del repositorio.
   */
  constructor(
    @Inject(NOTES_REPOSITORY_TOKEN)
    private readonly notesRepo: INotesRepository,
  ) {}

  /**
   * Obtiene un listado general de las notas.
   * Aplica filtros de búsqueda por texto y ordenamiento.
   *
   * @param {Object} [options] - Opciones de filtrado y ordenamiento.
   * @param {string} [options.search] - Texto para buscar en título o contenido.
   * @param {'title' | 'createdAt' | 'updatedAt'} [options.sortBy] - Campo por el cual ordenar.
   * @param {'asc' | 'desc'} [options.order] - Dirección del ordenamiento.
   * @returns {Promise<NoteSummaryDto[]>} Lista de notas resumidas (sin contenido).
   */
  async findAll(options?: {
    search?: string;
    sortBy?: 'title' | 'createdAt' | 'updatedAt';
    order?: 'asc' | 'desc';
  }): Promise<NoteSummaryDto[]> {
    const notes = await this.notesRepo.findAll();
    let filtered = notes;

    //Filtrado por texto
    if (options?.search) {
      const q = options.search.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q),
      );
    }

    //Ordenamiento
    if (options?.sortBy) {
      const key = options.sortBy;
      const dir = options.order === 'desc' ? -1 : 1;
      filtered = [...filtered].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av instanceof Date && bv instanceof Date) {
          return (av.getTime() - bv.getTime()) * dir;
        }
        return String(av).localeCompare(String(bv)) * dir;
      });
    }

    //Transformación a DTO
    return filtered.map((note) => this.toSummaryDto(note));
  }

  /**
   * Busca y recupera una nota específica por su ID.
   * * Retorna la nota completa incluyendo el contenido.
   *
   * @param {string} id - Identificador UUID de la nota.
   * @returns {Promise<NoteResponseDto>} La nota completa encontrada.
   * @throws {NotFoundException} Si no se encuentra ninguna nota con el ID proporcionado.
   */
  async findById(id: string): Promise<NoteResponseDto> {
    const note = await this.notesRepo.findById(id);
    if (!note) {
      throw new NotFoundException(`Nota con ID ${id} no encontrada`);
    }
    return this.toResponseDto(note);
  }

  /**
   * Crea una nueva nota en el sistema.
   * Utiliza `NoteFactory` para generar la instancia con ID y fechas automáticas.
   *
   * @param {CreateNoteDto} payload - Datos de la nota (título y contenido).
   * @returns {Promise<NoteResponseDto>} La nota recién creada.
   */
  async create(payload: CreateNoteDto): Promise<NoteResponseDto> {
    const note = NoteFactory.create(payload.title, payload.content);
    const created = await this.notesRepo.create(note);
    return this.toResponseDto(created);
  }

  /**
   * Actualiza los datos de una nota existente.
   **Actualiza automáticamente el campo `updatedAt`
   * a la fecha actual, independientemente de los datos enviados.
   *
   * @param {string} id - ID de la nota a modificar.
   * @param {UpdateNoteDto} payload - Datos parciales a actualizar.
   * @returns {Promise<NoteResponseDto>} La nota con los datos actualizados.
   * @throws {NotFoundException} Si la nota no existe.
   */
  async update(id: string, payload: UpdateNoteDto): Promise<NoteResponseDto> {
    const existing = await this.notesRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Nota con ID ${id} no encontrada`);
    }

    const updated: Note = {
      ...existing, // Mantiene los datos originales (id, createdAt)
      ...payload,  // Sobreescribe título/contenido si vienen
      updatedAt: new Date(), 
    };

    const saved = await this.notesRepo.update(updated);
    return this.toResponseDto(saved);
  }

  /**
   * Elimina una o varias notas del sistema.
   *
   * @param {string[]} ids - Arreglo de identificadores (UUIDs) a eliminar.
   * @returns {Promise<number>} El número total de notas eliminadas.
   */
  async delete(ids: string[]): Promise<number> {
    return this.notesRepo.delete(ids);
  }


  /**
   * Convierte una Entidad interna a un DTO de respuesta completa.
   * Expone todos los campos, incluyendo el contenido.
   * @private
   */
  private toResponseDto(note: Note): NoteResponseDto {
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  /**
   * Convierte una Entidad interna a un DTO de resumen.
   * **IMPORTANTE**: Omite el campo `content` para el listado general.
   * @private
   */
  private toSummaryDto(note: Note): NoteSummaryDto {
    return {
      id: note.id,
      title: note.title,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }
}