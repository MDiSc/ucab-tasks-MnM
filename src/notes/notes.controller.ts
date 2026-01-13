import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes, ValidationPipe 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { NoteSummaryDto } from './dto/note-summary.dto';
import { DeleteNotesDto } from './dto/delete-note.dto';

import { LogAction } from '../common/decorators/log-action.decorator';

/**
 * Controlador de Notas.
 * * Gestiona las peticiones HTTP (GET, POST, PATCH, DELETE) para el recurso 'notes'.
 * * Valida los datos de entrada usando DTOs y Pipes.
 * * Delega la lógica de negocio al servicio NotesService.
 */
@ApiTags('Notes')
@Controller('notes')
export class NotesController {
  
  /**
   * Inicializa el controlador inyectando el servicio de notas.
   * @param notesService - Instancia del servicio de lógica de negocio.
   */
  constructor(private readonly notesService: NotesService) {}

  /**
   * Crea una nueva nota en el sistema.
   * * Endpoint: POST /notes
   * @param createNoteDto - Objeto DTO con el título y contenido validados.
   * @returns La nota creada completa (NoteResponseDto).
   */
  @Post()
  @LogAction()
  @ApiOperation({ summary: 'Crear una nueva nota' })
  @ApiResponse({ status: 201, description: 'Nota creada exitosamente.', type: NoteResponseDto })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createNoteDto: CreateNoteDto): Promise<NoteResponseDto> {
    // Nota: Pasamos el DTO completo al servicio (ajustaremos el servicio en breve)
    return await this.notesService.create(createNoteDto);
  }

  /**
   * Obtiene el listado general de notas con opción de filtrado y ordenamiento.
   * * Endpoint: GET /notes
   * @param search - (Opcional) Texto para buscar en título o contenido.
   * @param sortBy - (Opcional) Campo para ordenar ('title', 'createdAt', 'updatedAt').
   * @param order - (Opcional) Dirección del orden ('asc', 'desc').
   * @returns Lista de resúmenes de notas (NoteSummaryDto).
   */
  @Get()
  @LogAction()
  @ApiOperation({ summary: 'Listar notas (filtro, orden y sin contenido)' })
  @ApiResponse({ status: 200, description: 'Listado obtenido.', type: [NoteSummaryDto] })
  @ApiQuery({ name: 'search', required: false, description: 'Filtrar por texto' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['title', 'createdAt', 'updatedAt'] })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  async findAll(
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'title' | 'createdAt' | 'updatedAt',
    @Query('order') order?: 'asc' | 'desc',
  ): Promise<NoteSummaryDto[]> {
    const notes = await this.notesService.findAll({ search, sortBy, order });
    return notes.map((n) => ({
      id: n.id,
      title: n.title,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }));
  }

  /**
   * Obtiene una nota específica por su ID.
   * * Endpoint: GET /notes/:id
   * @param id - Identificador único (UUID) de la nota.
   * @returns La nota completa con todos sus detalles.
   */
  @Get(':id')
  @LogAction()
  @ApiOperation({ summary: 'Obtener nota por ID (con contenido)' })
  @ApiResponse({ status: 200, description: 'Nota encontrada.', type: NoteResponseDto })
  @ApiResponse({ status: 404, description: 'Nota no encontrada.' })
  async findOne(@Param('id') id: string): Promise<NoteResponseDto> {
    return await this.notesService.findOne(id);
  }

  /**
   * Actualiza el título o contenido de una nota existente.
   * * Endpoint: PATCH /notes/:id
   * @param id - Identificador de la nota a modificar.
   * @param updateNoteDto - Datos parciales a actualizar.
   * @returns La nota actualizada.
   */
  @Patch(':id')
  @LogAction()
  @ApiOperation({ summary: 'Actualizar una nota existente' })
  @ApiResponse({ status: 200, description: 'Nota actualizada.', type: NoteResponseDto })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('id') id: string, 
    @Body() updateNoteDto: UpdateNoteDto
  ): Promise<NoteResponseDto> {
    return await this.notesService.update(id, updateNoteDto);
  }

  /**
   * Elimina una o varias notas del sistema.
   * * Endpoint: DELETE /notes
   * @param deleteNotesDto - Objeto JSON que contiene el array de IDs.
   * @returns Objeto con la cantidad de notas eliminadas.
   */
  @Delete()
  @LogAction()
  @ApiOperation({ summary: 'Eliminar una o varias notas (Batch)' })
  @ApiResponse({ status: 200, description: 'Notas eliminadas.' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async remove(@Body() deleteNotesDto: DeleteNotesDto): Promise<{ removed: number }> {
    const count = await this.notesService.remove(deleteNotesDto.ids);
    return { removed: count };
  }
}