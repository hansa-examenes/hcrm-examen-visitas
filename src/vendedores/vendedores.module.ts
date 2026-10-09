import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vendedor, VendedorSchema } from './vendedor.schema';
import { VendedoresController } from './vendedores.controller';
import { VendedoresService } from './vendedores.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Vendedor.name, schema: VendedorSchema }])],
  controllers: [VendedoresController],
  providers: [VendedoresService],
  exports: [VendedoresService],
})
export class VendedoresModule {}
