import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';

@Entity({ name: 'contratos' })
export class Contrato {
  @PrimaryGeneratedColumn()
  id: number;

  // Sin relación inversa para no depender de cliente.contratos
  @ManyToOne(() => Cliente, { nullable: false, onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ type: 'date', nullable: true })
  fecha_firma: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  monto_total: string | null;

  @Column({ type: 'text', nullable: true })
  firma: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'creado_en' })
  creado_en: Date;
}