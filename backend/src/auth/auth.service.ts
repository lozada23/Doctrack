// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  private async validarUsuario(email: string, password: string) {
    const usuario = await this.usuariosService.findByEmail(email);
    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');
    const ok = await bcrypt.compare(password, usuario.password_hash);
    if (!ok) throw new UnauthorizedException('Contraseña incorrecta');
    return usuario;
  }

  async login(email: string, password: string) {
    const usuario = await this.validarUsuario(email, password);

    // ✅ Generamos un token de sesión (servidor) y lo guardamos en BD
    const sessionToken = randomBytes(32).toString('hex'); // 64 chars
    await this.usuariosService.update(usuario.id, { token: sessionToken });

    // ✅ Lo incluimos en el JWT como jti
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      jti: sessionToken,
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    });

    return {
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
        rol: usuario.rol,
        foto_url: usuario.foto_url,
      },
    };
  }
}