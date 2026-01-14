import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { Note } from '../entities/note.entity';
import { INotesRepository } from './notes.repository.interface';

/**
 * Implementación del repositorio de notas basada en persistencia de archivos JSON.
 * Cumple con el patrón de diseño Repository y permite cambiar la fuente de datos
 * sin afectar la lógica de negocio, tal como pide el proyecto.
 * @implements {INotesRepository}
 */
@Injectable()
export class JsonNotesRepository implements INotesRepository {
  private readonly dbPath: string;

  /**
   * Inicializa el repositorio y define la ruta del archivo.
   * @param dbFileName - Nombre del archivo JSON (por defecto 'database.json').
   */
  constructor() {
    this.dbPath = path.resolve(process.cwd(), 'database.json');
  }

  /**
   * Verifica si el archivo JSON existe. Si no, crea uno con un arreglo vacío.
   * Asegura que la app no falle la primera vez que se ejecuta.
   * @returns Una promesa vacía al terminar la verificación.
   */
  async init(): Promise<void> {
    try {
      await fs.access(this.dbPath);
    } catch {
      await fs.writeFile(this.dbPath, '[]', 'utf-8');
    }
  }

  /**
   * Obtiene todas las notas almacenadas en el archivo JSON.
   * @returns Promesa que resuelve con un arreglo de objetos Note.
   */
  async findAll(): Promise<Note[]> {
    const notes = await this.readDB();
    return notes;
  }

  /**
   * Busca una nota específica por su ID.
   * @param id - El identificador único de la nota.
   * @returns La nota encontrada o null si no existe.
   */
  async findById(id: string): Promise<Note | null> {
    const notes = await this.readDB();
    return notes.find((n) => n.id === id) ?? null;
  }

  /**
   * Guarda una nueva nota en el archivo.
   * @param note - La entidad Note completa a guardar.
   * @returns La nota guardada.
   */
  async create(note: Note): Promise<Note> {
    const notes = await this.readDB();
    notes.push(note);
    await this.writeDB(notes);
    return note;
  }

  /**
   * Actualiza una nota existente.
   * @param note - La nota con los datos modificados.
   * @returns La nota actualizada.
   * @throws {NotFoundException} Si la nota con ese ID no existe en el archivo.
   */
  async update(note: Note): Promise<Note> {
    const notes = await this.readDB();
    const idx = notes.findIndex((n) => n.id === note.id);

    if (idx === -1) {
      throw new NotFoundException(`Note with id ${note.id} not found`);
    }

    notes[idx] = note;
    await this.writeDB(notes);
    return note;
  }

  /**
   * Elimina una o varias notas del archivo JSON.
   * @param ids - Arreglo con los IDs de las notas a eliminar.
   * @returns La cantidad de notas que fueron eliminadas.
   */
  async delete(ids: string[]): Promise<number> {
    const notes = await this.readDB();
    const set = new Set(ids);
    const cantBefore = notes.length;
    const remaining = notes.filter((n) => !set.has(n.id));
    const removed = cantBefore - remaining.length;
    await this.writeDB(remaining);
    return removed;
  }

  /**
   * Lee el archivo JSON del disco y lo parsea a objetos.
   * @private
   * @returns Arreglo de notas. Si falla la lectura, devuelve arreglo vacío.
   */
  private async readDB(): Promise<Note[]> {
    await this.init();
    try {
      const raw = await fs.readFile(this.dbPath, 'utf-8');
      const parsed = JSON.parse(raw) as Note[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Guarda el arreglo de notas.
   * @private
   * @param notes - El arreglo completo de notas a persistir.
   */
  private async writeDB(notes: Note[]): Promise<void> {
    await fs.writeFile(this.dbPath, JSON.stringify(notes, null, 2), 'utf-8');
  }
}