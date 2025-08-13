import { IsInt, IsOptional, IsDateString, IsNumberString, IsString } from 'class-validator';

export class CreateContratoDto {
  @IsInt()
  cliente_id: number;

  @IsOptional()
  @IsDateString()
  fecha_firma?: string;

  @IsOptional()
  @IsNumberString()
  // Se envía como string ("123.45"); TypeORM lo persiste como numeric(10,2)
  monto_total?: string;

  @IsOptional()
  @IsString()
  firma?: string;
}