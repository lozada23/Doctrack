import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
  Put,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ContratosService } from './contratos.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('contratos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContratosController {
  constructor(private readonly service: ContratosService) {}

  @Post()
  @Roles('administrador', 'preparador', 'cliente')
  async create(@Body() dto: CreateContratoDto, @Req() req: any) {
    return this.service.create(dto, req.user);
  }

  @Get()
  @Roles('administrador', 'preparador', 'cliente')
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('cliente_id') cliente_id?: number,
    @Query('firmado') firmado?: 'si' | 'no',
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('q') q?: string,
    @Query('monto_min') monto_min?: string,
    @Query('monto_max') monto_max?: string,
    @Query('order') order?: 'creado_en' | 'fecha_firma' | 'monto_total',
    @Query('dir') dir?: 'ASC' | 'DESC',
    @Req() req?: any,
  ) {
    return this.service.findAll(
      {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        cliente_id: cliente_id ? Number(cliente_id) : undefined,
        firmado,
        desde,
        hasta,
        q,
        monto_min,
        monto_max,
        order,
        dir,
      },
      req.user,
    );
  }

  @Get(':id')
  @Roles('administrador', 'preparador', 'cliente')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.findOne(id, req.user);
  }

  @Put(':id')
  @Roles('administrador', 'preparador', 'cliente')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContratoDto, @Req() req: any) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles('administrador', 'preparador')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.remove(id, req.user);
  }

  // Auxiliar: listar por cliente
  @Get('/cliente/:clienteId')
  @Roles('administrador', 'preparador', 'cliente')
  async byCliente(@Param('clienteId', ParseIntPipe) clienteId: number, @Req() req: any) {
    return this.service.findAll({ cliente_id: clienteId, limit: 50 }, req.user);
  }
}