import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { UpdateMiPerfilDto } from './dto/update-mi-perfil.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../auth/user.decorator';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  // ✅ Crear cliente (solo admin o preparador). El "cliente" NO puede crear.
  @UseGuards(JwtAuthGuard)
  @Roles('administrador', 'preparador')
  @Post()
  create(@User() usuario: any, @Body() dto: CreateClienteDto) {
    // Crea el cliente asociando como "owner" al usuario autenticado (admin/preparador).
    return this.clientesService.createConUsuario(usuario.id, dto);
  }

  // ✅ Crear cliente para OTRO usuario (solo admin / preparador)
  @UseGuards(JwtAuthGuard)
  @Roles('administrador', 'preparador')
  @Post('de-usuario/:usuarioId')
  createParaOtroUsuario(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Body() dto: CreateClienteDto,
  ) {
    return this.clientesService.createConUsuario(usuarioId, dto);
  }

  // ✅ Ver todos los clientes (solo administrador)
  @UseGuards(JwtAuthGuard)
  @Roles('administrador')
  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  // ✅ Ver los clientes asignados a un preparador (por su id en token)
  @UseGuards(JwtAuthGuard)
  @Roles('preparador')
  @Get('mios')
  findByPreparador(@User() usuario: any) {
    return this.clientesService.findByPreparador(usuario.id);
  }

  // ✅ Ver su propio perfil (cliente)
  @UseGuards(JwtAuthGuard)
  @Roles('cliente')
  @Get('mi-perfil')
  obtenerMiPerfil(@User() usuario: any) {
    return this.clientesService.buscarPorUsuarioId(usuario.id);
  }

  // ✅ Crear o actualizar su propio perfil (cliente)
  @UseGuards(JwtAuthGuard)
  @Roles('cliente')
  @Put('mi-perfil')
  crearOActualizarMiPerfil(
    @User() usuario: any,
    @Body() dto: UpdateMiPerfilDto,
  ) {
    return this.clientesService.crearOActualizarPorUsuario(usuario.id, dto);
  }

  // ✅ Ver un cliente específico (admin o preparador)
  @UseGuards(JwtAuthGuard)
  @Roles('administrador', 'preparador')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  // ✅ Actualizar cliente por id (admin o preparador)
  @UseGuards(JwtAuthGuard)
  @Roles('administrador', 'preparador')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, dto);
  }

  // ✅ Eliminar cliente (solo admin)
  @UseGuards(JwtAuthGuard)
  @Roles('administrador')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.remove(id);
  }
}