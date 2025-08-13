// src/clientes/dto/update-mi-perfil.dto.ts
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export enum TramiteContratado {
  INICIAL = 'inicial',
  RENOVACION = 'renovacion',
}

export enum EstadoCliente {
  NUEVO = 'nuevo',
  EVALUANDO = 'evaluando',
  ACTIVO = 'activo',
  CERRADO = 'cerrado',
}

export class UpdateMiPerfilDto {
  @IsOptional()
  @IsString()
  nombre_completo?: string;

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
  @IsEnum(TramiteContratado)
  tramite_contratado?: TramiteContratado;

  @IsOptional()
  @IsBoolean()
  contrato_firmado?: boolean;

  @IsOptional()
  @IsBoolean()
  pago_anticipo?: boolean;

  @IsOptional()
  @IsEnum(EstadoCliente)
  estado_cliente?: EstadoCliente;
}