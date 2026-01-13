import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
	@ApiProperty({ description: 'Título de la nota', example: 'Ideas para el proyecto' })
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiProperty({ description: 'Contenido de la nota', example: 'Anotar tareas y pendientes' })
	@IsString()
	@IsNotEmpty()
	content: string;
}

