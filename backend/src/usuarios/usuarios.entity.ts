import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre_completo: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  telefono: string;

  @Column()
  password_hash: string;

  @Column()
  rol: string;

  @Column({ nullable: true })
  foto_url: string;

  @Column({ type: 'text', nullable: true })
  token: string | null;  

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'timestamp', nullable: true })
  ultimo_acceso: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creado_en: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  actualizado_en: Date;

  @OneToMany(() => Cliente, (cliente) => cliente.preparador)
  clientes: Cliente[];

  @OneToMany(() => Cliente, (cliente) => cliente.usuario)
  clientes_propios: Cliente[];

}
