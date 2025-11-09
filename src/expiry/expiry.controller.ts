/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExpiryService } from './expiry.service';
import { CookedExpiryMetaDto } from 'src/items/dtos/cooked-expiry.dto';

@Controller('expiry')
export class ExpiryController {
  constructor(private readonly expiryService: ExpiryService) {}

  @Post('extract-expiry')
  @UseInterceptors(FileInterceptor('image'))
  async extractExpiry(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    const result = await this.expiryService.extractExpiryFromImage(file);
    return result;
  }

  @Post('estimate-cooked')
  @UseInterceptors(FileInterceptor('image'))
  async estimateCooked(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CookedExpiryMetaDto, //
  ) {
    const storage = body.storage as 'room' | 'fridge' | 'freezer';
    const cookedAt = body.cookedAt as string | undefined;

    const result = await this.expiryService.estimateCookedFoodExpiry(file, {
      storage,
      cookedAt,
    });

    return result;
  }
}
