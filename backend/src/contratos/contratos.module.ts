import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contrato } from './contrato.entity';
import { ContratosService } from './contratos.service';
import { ContratosController } from './contratos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Contrato])],
  controllers: [ContratosController],
  providers: [ContratosService],
  exports: [TypeOrmModule, ContratosService],
})
export class ContratosModule {}