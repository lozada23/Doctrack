import {
    IsString,
    IsEmail,
    IsOptional,
    IsBoolean,
    IsIn,
    IsUrl,
    Length
  } from 'class-validator';
  
  export class CreateUsuarioDto {
    @IsString()
    @Length(3, 100)
    nombre_completo: string;
  
    @IsEmail()
    email: string;
  
    @IsOptional()
    @IsString()
    telefono?: string;
  
    @IsString()
    @Length(6)
    password_hash: string;
  
    @IsIn(['administrador', 'preparador', 'cliente'])
    rol: string;
  
    @IsOptional()
    @IsUrl()
    foto_url?: string;
  
    @IsOptional()
    @IsString()
    token?: string;
  
    @IsOptional()
    @IsBoolean()
    activo?: boolean;
  }
  