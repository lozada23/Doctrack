import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';
import { Usuario } from './usuarios.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async logout(userId: number): Promise<void> {
    // Opción A: limpiar token (cualquier JWT previo será inválido)
    await this.usuarioRepo.update({ id: userId }, { token: null, actualizado_en: new Date() });
  }
  /**
   * Retorna todos los usuarios (sin exponer password_hash).
   */
  async findAll(): Promise<Partial<Usuario>[]> {
    return this.usuarioRepo.find({
      select: ['id', 'nombre_completo', 'email', 'rol', 'creado_en', 'actualizado_en'],
      order: { nombre_completo: 'ASC' },
    });
  }

  /**
   * Busca un usuario por ID (lanza 404 si no existe).
   * No expone password_hash en la respuesta.
   */
  async findOne(id: number): Promise<Partial<Usuario>> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id },
      select: ['id', 'nombre_completo', 'email', 'rol', 'creado_en', 'actualizado_en'],
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  /**
   * Busca un usuario por email (incluye password_hash para procesos internos, p. ej., login).
   */
  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({
      where: { email },
      // Para autenticación suele necesitarse el hash
      // si no lo necesitas en tu flujo, puedes omitir "select" para traer todo.
    });
  }

  /**
   * Busca un usuario por ID incluyendo todos los campos (para validación JWT).
   */
  async findEntityById(id: number): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({
      where: { id },
    });
  }

  /**
   * Crea un usuario. Espera "password_hash" con la contraseña en texto plano
   * (mantengo tu interfaz actual para no romperte otros lugares).
   * - Valida que el email no exista.
   * - Hashea la contraseña.
   * - No retorna el hash.
   */
  async create(data: Partial<Usuario>): Promise<Partial<Usuario>> {
    if (!data?.email) {
      throw new BadRequestException('El email es obligatorio');
    }
    if (!data?.password_hash) {
      throw new BadRequestException('La contraseña es obligatoria');
    }

    // Unicidad por email
    const emailExists = await this.usuarioRepo.findOne({ where: { email: data.email } });
    if (emailExists) {
      throw new BadRequestException('Ya existe un usuario con ese email');
    }

    const saltOrRounds = 10;
    const hash = await bcrypt.hash(String(data.password_hash), saltOrRounds);

    const nuevoUsuario = this.usuarioRepo.create({
      ...data,
      password_hash: hash,
    } as Usuario);

    const saved = await this.usuarioRepo.save(nuevoUsuario);
    // No exponer el hash
    const { password_hash, ...safe } = saved as any;
    return safe;
  }

  /**
   * Actualiza un usuario.
   * - Si viene "password_hash", se interpreta como nueva contraseña en texto plano y se hashea.
   * - Valida que el email (si cambia) no esté ocupado por otro usuario.
   * - No retorna el hash.
   */
  async update(id: number, data: Partial<Usuario>): Promise<Partial<Usuario>> {
    const usuario = await this.usuarioRepo.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Validar unicidad de email si cambia
    if (data.email && data.email !== usuario.email) {
      const emailTaken = await this.usuarioRepo.findOne({
        where: { email: data.email, id: Not(id) },
      });
      if (emailTaken) {
        throw new BadRequestException('El email ya está en uso por otro usuario');
      }
    }

    // Si envías "password_hash" como nueva contraseña en texto plano
    if (data.password_hash) {
      const saltOrRounds = 10;
      data.password_hash = await bcrypt.hash(String(data.password_hash), saltOrRounds);
    }

    Object.assign(usuario, data);
    const updated = await this.usuarioRepo.save(usuario);

    const { password_hash, ...safe } = updated as any;
    return safe;
  }

  /**
   * Elimina un usuario por ID.
   */
  async remove(id: number): Promise<{ ok: true; deletedId: number }> {
    const result = await this.usuarioRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return { ok: true, deletedId: id };
  }

  /**
   * Búsqueda para autocompletado por rol y texto libre (nombre/email).
   * Retorna solo campos públicos (sin password_hash).
   */
  async buscarPorRolYNombre(
    rol: 'preparador' | 'administrador',
    q: string,
  ): Promise<Partial<Usuario>[]> {
    // Dos condiciones OR: nombre_completo ILike q O email ILike q
    const users = await this.usuarioRepo.find({
      select: ['id', 'nombre_completo', 'email', 'rol'],
      where: [
        { rol, nombre_completo: ILike(`%${q}%`) },
        { rol, email: ILike(`%${q}%`) },
      ],
      order: { nombre_completo: 'ASC' },
      take: 10,
    });
    return users;
  }
}