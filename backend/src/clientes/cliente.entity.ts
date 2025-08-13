import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuarios.entity';

export type EstadoCliente = 'nuevo' | 'evaluando' | 'activo' | 'cerrado';
export type TramiteContratado = 'inicial' | 'renovacion';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  nombre_completo: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  pasaporte?: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email?: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefono?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  canal_entrada?: string | null;

  @Column({ type: 'boolean', default: false })
  cita_pagada: boolean;

  @Column({
    type: 'enum',
    enum: ['inicial', 'renovacion'],
    nullable: true,
  })
  tramite_contratado?: TramiteContratado | null;

  @Column({ type: 'boolean', default: false })
  contrato_firmado: boolean;

  @Column({ type: 'boolean', default: false })
  pago_anticipo: boolean;

  @Column({
    type: 'enum',
    enum: ['nuevo', 'evaluando', 'activo', 'cerrado'],
    default: 'nuevo',
  })
  estado_cliente: EstadoCliente;

  // ⚠️ HAZLO NULLABLE POR AHORA para que no se caiga la sincronización con filas antiguas
  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario | null;

  // Preparador asignado
  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'preparador_id' })
  preparador?: Usuario | null;

  @CreateDateColumn({ name: 'creado_en' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizado_en: Date;
}