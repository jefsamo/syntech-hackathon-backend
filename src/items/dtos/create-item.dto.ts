// src/items/dto/create-item.dto.ts
export class CreateItemDto {
  username: string;

  barcode: string;
  name?: string;
  brand?: string;
  quantity?: string;
  imageUrl?: string;
  categories?: string;
  nutriScore?: string;
  expiry: string;
  expiryRaw?: string;
}
