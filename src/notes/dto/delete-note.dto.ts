import { IsArray, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteNotesDto {
  @ApiProperty({
    description: 'Lista de IDs de las notas a eliminar',
    example: ['uuid-1', 'uuid-2'],
    type: [String], 
  })
  @IsArray()
  @IsString({ each: true }) 
  @IsNotEmpty()
  ids: string[];
}