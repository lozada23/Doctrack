import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Contrato } from './contrato.entity';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';

@Injectable()
export class ContratosService {
  constructor(
    @InjectRepository(Contrato)
    private readonly repo: Repository<Contrato>,
  ) {}

  private baseQB(): SelectQueryBuilder<Contrato> {
    return this.repo.createQueryBuilder('c').leftJoinAndSelect('c.cliente', 'cliente');
  }

  /** Restringe por rol: si es 'cliente', solo ve contratos de su propio cliente (clientes.usuario_id = user.id) */
  private applyRoleScope(qb: SelectQueryBuilder<Contrato>, user: any) {
    if (user?.rol === 'cliente') {
      qb.andWhere('cliente.usuario_id = :uid', { uid: user.id });
    }
  }

  async create(dto: CreateContratoDto, user: any): Promise<Contrato> {
    // Cliente solo puede crear contratos para su propio cliente
    if (user?.rol === 'cliente') {
      const belongs = await this.repo.manager
        .createQueryBuilder()
        .select('1')
        .from('clientes', 'cl')
        .where('cl.id = :cid AND cl.usuario_id = :uid', { cid: dto.cliente_id, uid: user.id })
        .getRawOne();

      if (!belongs) throw new ForbiddenException('No puedes crear contratos para otro cliente.');
    }

    const contrato = this.repo.create({
      ...dto,
      cliente: { id: dto.cliente_id } as any,
    });
    return this.repo.save(contrato);
  }

  async findAll(
    params: {
      page?: number; limit?: number;
      cliente_id?: number;
      firmado?: 'si' | 'no';
      desde?: string; // fecha_firma desde
      hasta?: string; // fecha_firma hasta
      q?: string;     // búsqueda por nombre/email del cliente
      monto_min?: string;
      monto_max?: string;
      order?: 'creado_en' | 'fecha_firma' | 'monto_total';
      dir?: 'ASC' | 'DESC';
    },
    user: any,
  ) {
    const {
      page = 1,
      limit = 10,
      cliente_id,
      firmado,
      desde,
      hasta,
      q,
      monto_min,
      monto_max,
      order = 'creado_en',
      dir = 'DESC',
    } = params;

    const qb = this.baseQB();
    this.applyRoleScope(qb, user);

    if (cliente_id) qb.andWhere('cliente.id = :cliente_id', { cliente_id });
    if (firmado === 'si') qb.andWhere('c.firma IS NOT NULL');
    if (firmado === 'no') qb.andWhere('c.firma IS NULL');
    if (desde) qb.andWhere('c.fecha_firma >= :desde', { desde });
    if (hasta) qb.andWhere('c.fecha_firma <= :hasta', { hasta });
    if (monto_min) qb.andWhere('c.monto_total >= :monto_min', { monto_min });
    if (monto_max) qb.andWhere('c.monto_total <= :monto_max', { monto_max });

    if (q) {
      // Si no usas extensión unaccent, cambia a ILIKE simple
      qb.andWhere(
        `(unaccent(lower(cliente.nombre_completo)) LIKE unaccent(lower(:q))
           OR lower(cliente.email) LIKE lower(:q))`,
        { q: `%${q}%` },
      );
    }

    qb.orderBy(`c.${order}`, dir);

    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { page, limit, total, data };
  }

  async findOne(id: number, user: any): Promise<Contrato> {
    const qb = this.baseQB().where('c.id = :id', { id });
    this.applyRoleScope(qb, user);
    const contrato = await qb.getOne();
    if (!contrato) throw new NotFoundException('Contrato no encontrado');
    return contrato;
  }

  async update(id: number, dto: UpdateContratoDto, user: any): Promise<Contrato> {
    const actual = await this.findOne(id, user);

    // Cambio de cliente: cliente (rol) no puede
    if (dto.cliente_id && dto.cliente_id !== actual.cliente.id) {
      if (user?.rol === 'cliente') {
        throw new ForbiddenException('No puedes reasignar el contrato a otro cliente.');
      }
      actual.cliente = { id: dto.cliente_id } as any;
    }

    if (dto.fecha_firma !== undefined) actual.fecha_firma = dto.fecha_firma;
    if (dto.monto_total !== undefined) actual.monto_total = dto.monto_total;
    if (dto.firma !== undefined) actual.firma = dto.firma;

    return this.repo.save(actual);
  }

  async remove(id: number, user: any): Promise<{ success: true }> {
    const contrato = await this.findOne(id, user);
    await this.repo.remove(contrato);
    return { success: true };
  }
}