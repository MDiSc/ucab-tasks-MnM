import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INotesRepository, NOTES_REPOSITORY } from './repositories/notes.repository.interface';
import { Note } from './entities/note.entity';
import { NoteFactory } from './factories/note.factory';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

/**
 * Interface auxiliar para tipar los parámetros de búsqueda y filtrado.
 * Permite que el método findAll sea extensible sin cambiar su firma.
 */
interface FindAllParams {
  search?: string;
  sortBy?: 'title' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
}

/**
 * Servicio de Notas.
 * * Coordina las interacciones entre el Controlador y el Repositorio.
 * * Aplica transformaciones, validaciones lógicas y reglas de negocio (ej. actualización de fechas).
 */
@Injectable()
export class NotesService {
  /**
   * Inicializa el servicio inyectando la dependencia del repositorio.
   * @param notesRepo - Implementación concreta del almacenamiento (JSON).
   */
  constructor(
    @Inject(NOTES_REPOSITORY) private readonly notesRepo: INotesRepository,
  ) {}

  /**
   * Crea una nueva nota en el sistema.
   * @param createNoteDto - Objeto de transferencia con los datos validados (título y contenido).
   * @returns La entidad Note persistida.
   */
  async create(createNoteDto: CreateNoteDto): Promise<Note> {
    const newNote = NoteFactory.create(createNoteDto.title, createNoteDto.content);
    return await this.notesRepo.create(newNote);
  }

  /**
   * Obtiene el listado de notas aplicando filtros y ordenamiento.
   * * Lógica de Búsqueda: Insensible a mayúsculas/minúsculas.
   * * Lógica de Orden: Maneja correctamente la comparación entre Strings y Fechas.
   * * @param params - Objeto con criterios de búsqueda (search) y ordenamiento (sortBy, order).
   * @returns Arreglo de notas filtradas y ordenadas.
   */
  async findAll(params: FindAllParams): Promise<Note[]> {
    
    let notes = await this.notesRepo.findAll();
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      notes = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchLower) ||
          note.content.toLowerCase().includes(searchLower),
      );
    }

    if (params.sortBy) {
      notes.sort((a, b) => {
        let valA = a[params.sortBy!];
        let valB = b[params.sortBy!];

        if (params.sortBy !== 'title') {
          valA = new Date(valA as Date).getTime();
          valB = new Date(valB as Date).getTime();
        } else {          
          valA = (valA as string).toLowerCase();
          valB = (valB as string).toLowerCase();
        }
        
        if (valA < valB) return params.order === 'asc' ? -1 : 1;
        if (valA > valB) return params.order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return notes;
  }

  /**
   * Busca una nota específica por su identificador único.
   * @param id - UUID de la nota solicitada.
   * @returns La entidad Note encontrada.
   * @throws {NotFoundException} Si el ID no existe en la base de datos (HTTP 404).
   */
  async findOne(id: string): Promise<Note> {
    const note = await this.notesRepo.findById(id);
    if (!note) {
      throw new NotFoundException(`Nota con ID ${id} no encontrada`);
    }
    return note;
  }

  /**
   * Actualiza una nota existente aplicando cambios parciales.
   * @param id - Identificador de la nota.
   * @param updateNoteDto - Objeto con los campos a modificar (título y/o contenido).
   * @returns La nota actualizada y persistida.
   */
  async update(id: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    
    const note = await this.findOne(id);

    if (updateNoteDto.title) note.title = updateNoteDto.title;
    if (updateNoteDto.content) note.content = updateNoteDto.content;

    note.updatedAt = new Date();

    return await this.notesRepo.update(note);
  }

  /**
   * Elimina una o más de notas del sistema.
   * @param ids - Arreglo de identificadores (UUIDs) a eliminar.
   * @returns El número total de registros eliminados exitosamente.
   */
  async remove(ids: string[]): Promise<number> {
    return await this.notesRepo.delete(ids);
  }
}