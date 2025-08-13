// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly usuariosService: UsuariosService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'supersecreto'),
    });
  }

  async validate(payload: any) {
    const user = await this.usuariosService.findEntityById(payload.sub);
    // ✅ Comparar el jti del JWT con el token de sesión guardado
    if (!user?.token || payload.jti !== user.token) {
      throw new UnauthorizedException('Sesión inválida. Inicia sesión de nuevo.');
    }
    return { id: user.id, sub: user.id, email: user.email, rol: user.rol };
  }
}