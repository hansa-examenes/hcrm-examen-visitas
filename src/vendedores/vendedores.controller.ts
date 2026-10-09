import { Controller, Get, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Vendedor } from './vendedor.schema';
import { VendedoresService } from './vendedores.service';

@ApiTags('vendedores')
@Controller('vendedores')
export class VendedoresController {
  constructor(private readonly service: VendedoresService) {}

  @Get()
  @ApiOperation({ summary: 'Lista los vendedores' })
  @ApiOkResponse({ type: [Vendedor] })
  listar() {
    return this.service.listar();
  }

  @Get(':codigo')
  @ApiOperation({ summary: 'Obtiene un vendedor por código' })
  @ApiOkResponse({ type: Vendedor })
  @ApiNotFoundResponse({ description: 'El vendedor no existe' })
  obtener(@Param('codigo') codigo: string) {
    return this.service.obtener(codigo);
  }
}
