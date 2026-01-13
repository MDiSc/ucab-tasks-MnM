import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Note } from '../entities/note.entity';
import { INotesRepository } from './notes.repository.interface';

/**
 * Implementación del repositorio usando un archivo JSON local.
 * Simula una base de datos leyendo y escribiendo en 'database.json'.
 * * @implements {INotesRepository}
 */
@Injectable()
export class JsonNotesRepository implements INotesRepository {

  private filePath = path.join(process.cwd(), 'database.json');

  /**
   * Lee el archivo JSON y lo convierte en objetos de JavaScript.
   * Si el archivo no existe, retorna un arreglo vacío para no romper la app.
   * * @returns Promesa con el arreglo de notas actual.
   */
  private async loadNotes(): Promise<Note[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
        return [];
    }
  }

  /**
   * Toma el arreglo de notas y lo sobrescribe en el archivo JSON.
   * Formatea el JSON con sangría de 2 espacios para que sea legible.
   * * @param notes - El arreglo completo de notas a guardar.
   */
  private async saveNotes(notes: Note[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(notes, null, 2));
  }
  
  /**
   * @inheritdoc
   */
  async findAll(): Promise<Note[]> {
    return await this.loadNotes();
  }

  /**
   * @inheritdoc
   */
  async findById(id: string): Promise<Note | null> {
    const notes = await this.loadNotes();
    return notes.find((note) => note.id === id) || null;
  }

  /**
   * @inheritdoc
   */
  async create(note: Note): Promise<Note> {
    const notes = await this.loadNotes();
    notes.push(note);
    await this.saveNotes(notes);
    return note;
  }

  /**
   * @inheritdoc
   * @throws {NotFoundException} Si la nota con ese ID no existe.
   */
  async update(note: Note): Promise<Note> {
    const notes = await this.loadNotes();
    const index = notes.findIndex((n) => n.id === note.id);

    if (index === -1) {
        throw new NotFoundException(`Note with ID ${note.id} not found`);
    }

    notes[index] = note;
    await this.saveNotes(notes);
    return note;
  }

  /**
   * @inheritdoc
   */
  async delete(id: string): Promise<void> {
    const notes = await this.loadNotes();
    const newNotes = notes.filter((n) => n.id !== id);
    await this.saveNotes(newNotes);
  }
}