import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vendedor } from './vendedor.schema';

@Injectable()
export class VendedoresService {
  constructor(@InjectModel(Vendedor.name) private readonly vendedores: Model<Vendedor>) {}

  listar() {
    return this.vendedores.find().sort({ codigo: 1 }).lean();
  }

  async obtener(codigo: string) {
    const vendedor = await this.vendedores.findOne({ codigo }).lean();
    if (!vendedor) {
      throw new NotFoundException(`Vendedor ${codigo} no existe`);
    }
    return vendedor;
  }
}
