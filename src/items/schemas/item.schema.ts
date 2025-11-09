import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ItemDocument = Item & Document;

@Schema({ timestamps: true })
export class Item {
  [x: string]: any;
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  barcode: string;

  @Prop()
  name?: string;

  @Prop()
  brand?: string;

  @Prop()
  quantity?: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  categories?: string;

  @Prop()
  nutriScore?: string;

  @Prop({ required: true })
  expiry: string;

  @Prop()
  expiryRaw?: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
