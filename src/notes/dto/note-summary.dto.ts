import { ApiProperty } from '@nestjs/swagger';

export class NoteSummaryDto {
  @ApiProperty({ description: 'Identificador único (UUID) de la nota' })
  id: string;

  @ApiProperty({ description: 'Título de la nota' })
  title: string;

  @ApiProperty({ description: 'Fecha de creación', type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización', type: String, format: 'date-time' })
  updatedAt: Date;
}
