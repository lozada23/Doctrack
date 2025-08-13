import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Cliente, TramiteContratado, EstadoCliente } from './cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
  ) {}

  /**
   * Crea cliente asociado al usuario autenticado (admin/preparador).
   * - Si viene `preparador_id` en el DTO → asigna ese.
   * - Si NO viene → asigna como preparador al mismo usuario que crea.
   * Se fuerzan tipos para que TypeScript no escoja la sobrecarga de array.
   */
  async createConUsuario(usuario_id: number, dto: CreateClienteDto): Promise<Cliente> {
    const {
      preparador_id,
      tramite_contratado,
      estado_cliente,
      ...rest
    } = dto as any;

    const partial: DeepPartial<Cliente> = {
      ...rest,
      ...(tramite_contratado
        ? { tramite_contratado: tramite_contratado as TramiteContratado }
        : {}),
      ...(estado_cliente
        ? { estado_cliente: estado_cliente as EstadoCliente }
        : {}),
      usuario: { id: usuario_id } as any,
      preparador: { id: (preparador_id ?? usuario_id) } as any,
    };

    // 👇 Forzar que create devuelva "Cliente" y no "Cliente[]"
    const cliente: Cliente = this.clienteRepo.create(partial as DeepPartial<Cliente>) as Cliente;

    // 👇 save ahora es inequívocamente Promise<Cliente>
    return await this.clienteRepo.save(cliente);
  }

  // ✅ Listar todos los clientes
  async findAll(): Promise<Cliente[]> {
    return this.clienteRepo.find({
      relations: ['usuario', 'preparador'],
      order: { creado_en: 'DESC' },
    });
  }

  // ✅ Listar clientes por preparador
  async findByPreparador(preparadorId: number): Promise<Cliente[]> {
    return this.clienteRepo.find({
      where: { preparador: { id: preparadorId } },
      relations: ['usuario', 'preparador'],
      order: { creado_en: 'DESC' },
    });
  }

  // ✅ Buscar cliente por ID
  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepo.findOne({
      where: { id },
      relations: ['usuario', 'preparador'],
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  /**
   * ✅ Actualizar cliente por ID
   * - Soporta cambio de `preparador_id`.
   * - Castea enums si vienen como strings en el DTO.
   * - Evita sobrecarga de array tipando explícitamente.
   */
  async update(id: number, data: UpdateClienteDto): Promise<Cliente> {
    const existente = await this.clienteRepo.findOne({
      where: { id },
      relations: ['usuario', 'preparador'],
    });
    if (!existente) throw new NotFoundException('Cliente no encontrado');

    const {
      preparador_id,
      tramite_contratado,
      estado_cliente,
      ...rest
    } = (data as any) || {};

    Object.assign(existente, rest);

    if (typeof tramite_contratado !== 'undefined') {
      existente.tramite_contratado = (tramite_contratado || null) as TramiteContratado | null;
    }
    if (typeof estado_cliente !== 'undefined') {
      existente.estado_cliente = estado_cliente as EstadoCliente;
    }
    if (typeof preparador_id !== 'undefined') {
      if (preparador_id === null || preparador_id === '') {
        existente.preparador = null as any; // Permite desasignar si tu esquema lo admite
      } else {
        existente.preparador = { id: Number(preparador_id) } as any;
      }
    }

    const actualizado: Cliente = await this.clienteRepo.save(existente);
    return this.findOne(actualizado.id);
  }

  // ✅ Eliminar cliente (con verificación)
  async remove(id: number): Promise<void> {
    const res = await this.clienteRepo.delete(id);
    if (!res.affected) throw new NotFoundException('Cliente no encontrado');
  }

  // ✅ Ver perfil de cliente por usuario_id
  async buscarPorUsuarioId(usuario_id: number): Promise<Cliente> {
    const cliente = await this.clienteRepo.findOne({
      where: { usuario: { id: usuario_id } },
      relations: ['usuario', 'preparador'],
    });
    if (!cliente) throw new NotFoundException('No se encontró perfil de cliente asociado');
    return cliente;
  }

  /**
   * ✅ Crear o actualizar perfil del cliente autenticado
   * - Ignora `preparador_id` para que el cliente no lo cambie.
   * - Tipado explícito para evitar la sobrecarga de array.
   */
  async crearOActualizarPorUsuario(
    usuario_id: number,
    dto: UpdateClienteDto,
  ): Promise<Cliente> {
    const {
      preparador_id, // ignorado
      tramite_contratado,
      estado_cliente,
      ...rest
    } = (dto as any) || {};

    let cliente = await this.clienteRepo.findOne({
      where: { usuario: { id: usuario_id } },
      relations: ['usuario', 'preparador'],
    });

    if (cliente) {
      Object.assign(cliente, rest);
      if (typeof tramite_contratado !== 'undefined') {
        cliente.tramite_contratado = (tramite_contratado || null) as TramiteContratado | null;
      }
      if (typeof estado_cliente !== 'undefined') {
        cliente.estado_cliente = estado_cliente as EstadoCliente;
      }
      return await this.clienteRepo.save(cliente);
    }

    const partial: DeepPartial<Cliente> = {
      ...rest,
      ...(tramite_contratado ? { tramite_contratado: tramite_contratado as TramiteContratado } : {}),
      ...(estado_cliente ? { estado_cliente: estado_cliente as EstadoCliente } : {}),
      usuario: { id: usuario_id } as any,
    };

    const nuevo: Cliente = this.clienteRepo.create(partial as DeepPartial<Cliente>) as Cliente;
    return await this.clienteRepo.save(nuevo);
  }
}