import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';

import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { NoteSummaryDto } from './dto/note-summary.dto';
import { DeleteNotesDto } from './dto/delete-note.dto';
import { LogAction } from '../common/decorators/log-action.decorator';

@ApiTags('Notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  /**
   * Lista notas con filtros opcionales por texto y ordenamiento.
   * * Endpoint: GET /notes
   * @param search Texto a buscar en título y contenido.
   * @param sortBy Campo de ordenamiento.
   * @param order Dirección del orden.
   */
  @Get()
  @LogAction()
  @ApiOperation({ summary: 'Listar notas con filtros y ordenamiento' })
  @ApiResponse({ status: 200, description: 'Listado de notas', type: [NoteSummaryDto] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['title', 'createdAt', 'updatedAt'] })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  async findAll(
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'title' | 'createdAt' | 'updatedAt',
    @Query('order') order?: 'asc' | 'desc',
  ): Promise<NoteSummaryDto[]> {
    return this.notesService.findAll({ search, sortBy, order });
  }

  /**
   * Obtiene una nota específica.
   * * Endpoint: GET /notes/:id
   * @param id Identificador de la nota.
   */
  @Get(':id')
  @LogAction()
  @ApiOperation({ summary: 'Obtener una nota por ID' })
  @ApiResponse({ status: 200, description: 'Nota encontrada', type: NoteResponseDto })
  @ApiResponse({ status: 404, description: 'Nota no encontrada' })
  async findOne(@Param('id') id: string): Promise<NoteResponseDto> {
    return this.notesService.findById(id);
  }

  /**
   * Crea una nueva nota.
   * * Endpoint: POST /notes
   * @param dto Datos de creación (Validados por DTO).
   */
  @Post()
  @LogAction()
  @ApiOperation({ summary: 'Crear una nueva nota' })
  @ApiResponse({ status: 201, description: 'Nota creada', type: NoteResponseDto })
  @ApiConsumes('application/json')
  @UsePipes(new ValidationPipe({ whitelist: true })) // Activa la validación del DTO
  async create(@Body() dto: CreateNoteDto): Promise<NoteResponseDto> {
    return this.notesService.create(dto);
  }

  /**
   * Actualiza una nota existente.
   * * Endpoint: PATCH /notes/:id
   * @param id Identificador de la nota.
   * @param dto Datos a actualizar.
   */
  @Patch(':id')
  @LogAction()
  @ApiOperation({ summary: 'Actualizar una nota' })
  @ApiResponse({ status: 200, description: 'Nota actualizada', type: NoteResponseDto })
  @ApiConsumes('application/json')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ): Promise<NoteResponseDto> {
    return this.notesService.update(id, dto);
  }

  /**
   * Elimina una o varias notas.
   * * Endpoint: DELETE /notes
   * @param dto DTO que contiene el array de IDs a eliminar.
   */
  @Delete()
  @LogAction()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una o varias notas por ID(s)' })
  @ApiResponse({ status: 200, description: 'Conteo de notas eliminadas' })
  @ApiBody({ type: DeleteNotesDto }) 
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async delete(@Body() dto: DeleteNotesDto): Promise<{ removed: number }> {
    const removed = await this.notesService.delete(dto.ids);
    return { removed };
  }
}