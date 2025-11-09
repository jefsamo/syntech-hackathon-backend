/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class ExpiryService {
  private client: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  async extractExpiryFromImage(file: Express.Multer.File) {
    if (!file) {
      throw new InternalServerErrorException('No image file received');
    }

    const base64 = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;

    const prompt = `
You are helping extract expiration dates from product labels.
Look at the image and find the expiry / "best before" / "use by" date.

Return ONLY valid JSON of the form:
{"expiry": "YYYY-MM-DD" or null, "raw": "the date text exactly as written" or null}.

If you cannot clearly see any expiry date, set both fields to null.
`;

    try {
      const model = this.config.get<string>('OPENAI_MODEL') ?? 'gpt-5.1-mini';

      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content returned from OpenAI');
      }

      const parsed = JSON.parse(content);

      return {
        expiry: parsed.expiry ?? null,
        raw: parsed.raw ?? null,
      };
    } catch (error) {
      console.error('OpenAI vision error:', error);
      throw new InternalServerErrorException('Failed to extract expiry');
    }
  }
}
