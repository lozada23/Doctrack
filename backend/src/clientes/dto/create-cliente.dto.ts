import { IsBoolean, IsEmail, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClienteDto {
  @IsString()
  nombre_completo: string;

  @IsOptional()
  @IsString()
  pasaporte?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  canal_entrada?: string;

  @IsOptional()
  @IsBoolean()
  cita_pagada?: boolean;

  @IsOptional()
  @IsString()
  tramite_contratado?: string;

  @IsOptional()
  @IsBoolean()
  contrato_firmado?: boolean;

  @IsOptional()
  @IsBoolean()
  pago_anticipo?: boolean;

  @IsEnum(['nuevo', 'evaluando', 'activo', 'cerrado'])
  estado_cliente: 'nuevo' | 'evaluando' | 'activo' | 'cerrado';

  // Permite asociar un preparador por ID (opcional)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  preparador_id?: number;
}