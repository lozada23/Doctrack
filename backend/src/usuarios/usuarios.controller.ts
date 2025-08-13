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
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../auth/user.decorator';
import { AuthService } from '../auth/auth.service';
import { LoginDto } from './dto/login.dto';

class CreateUsuarioDto {
  nombre_completo: string;
  email: string;
  telefono?: string;
  password_hash: string;
  rol: string;
  foto_url?: string;
  token?: string;
}

class UpdateUsuarioDto {
  nombre_completo?: string;
  email?: string;
  telefono?: string;
  password_hash?: string;
  rol?: string;
  foto_url?: string;
  token?: string;
}

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly authService: AuthService, // ⬅️ necesario para /usuarios/login
  ) {}

  // ✅ Login: POST /usuarios/login (sin guard)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // ✅ Quién soy: GET /usuarios/me (útil para verificar el token)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@User() usuario: any) {
    return usuario; // { id, sub, email, rol }
  }

  // --- CRUD típico (si ya tienes otros DTOs, cámbialos por los tuyos) ---
  @UseGuards(JwtAuthGuard)
  @Roles('administrador')
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Roles('administrador')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('administrador')
  @Post()
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto as any);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('administrador')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, dto as any);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('administrador')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // Si tu servicio no tiene remove, crea ese método o cámbialo al nombre que uses (delete/removeUsuario, etc.)
    return this.usuariosService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@User() user: any) {
    await this.usuariosService.logout(user.id);
    return { mensaje: 'Logout exitoso' };
  }
}
