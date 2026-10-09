import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type VendedorDocument = HydratedDocument<Vendedor>;

// Colección `vendedores`, cargada por db/01-vendedores.js.
@Schema({ collection: 'vendedores', versionKey: false })
export class Vendedor {
  @ApiProperty({ example: 'V001' })
  @Prop({ required: true, unique: true })
  codigo: string;

  @ApiProperty({ example: 'Ana Rojas' })
  @Prop({ required: true })
  nombre: string;

  @ApiProperty({ example: 'Norte' })
  @Prop()
  zona: string;

  @ApiProperty({ example: true })
  @Prop({ default: true })
  activo: boolean;
}

export const VendedorSchema = SchemaFactory.createForClass(Vendedor);
