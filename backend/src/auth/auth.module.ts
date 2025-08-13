// src/auth/auth.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosModule } from '../usuarios/usuarios.module';

import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    forwardRef(() => UsuariosModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '8h' },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard, // 👈 AÑADIDO
    RolesGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard, // 👈 SE MANTIENE
    RolesGuard,
  ],
})
export class AuthModule {}