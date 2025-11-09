import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExpiryService } from './expiry.service';

@Controller('expiry')
export class ExpiryController {
  constructor(private readonly expiryService: ExpiryService) {}

  @Post('extract-expiry')
  @UseInterceptors(FileInterceptor('image'))
  async extractExpiry(@UploadedFile() file: Express.Multer.File) {
    const result = await this.expiryService.extractExpiryFromImage(file);
    return result;
  }
}
