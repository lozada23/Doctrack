import { PartialType } from '@nestjs/mapped-types';
import { CreateContratoDto } from './create-contrato.dto';
import { IsOptional, IsDateString, IsNumberString, IsString, IsInt } from 'class-validator';

export class UpdateContratoDto extends PartialType(CreateContratoDto) {
  @IsOptional()
  @IsInt()
  cliente_id?: number;

  @IsOptional()
  @IsDateString()
  fecha_firma?: string;

  @IsOptional()
  @IsNumberString()
  monto_total?: string;

  @IsOptional()
  @IsString()
  firma?: string;
}