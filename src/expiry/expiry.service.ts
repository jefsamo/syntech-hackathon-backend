/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

type StorageLocation = 'room' | 'fridge' | 'freezer';

@Injectable()
export class ExpiryService {
  private client: OpenAI;
  //

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

  async estimateCookedFoodExpiry(
    file: Express.Multer.File,
    opts: {
      storage: StorageLocation;
      cookedAt?: string;
    },
  ) {
    if (!file) {
      throw new InternalServerErrorException('No image file received');
    }
    //
    const base64 = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;

    const now = new Date();
    const cookedAtDate = opts.cookedAt ? new Date(opts.cookedAt) : now;
    const cookedAtIso = cookedAtDate.toISOString().slice(0, 10);

    const prompt = `
You help users estimate how long cooked food remains safe to eat.

The user gives:
- A photo of already cooked food (a leftover/meal).
- Storage location: ${opts.storage}
- Date it was cooked (YYYY-MM-DD): ${cookedAtIso}

Tasks:
1. Identify the likely type of food (e.g. "chicken stew", "pasta with meat", "vegetable salad with dairy", "fish curry", etc.).
2. Based on widely used food safety guidelines for leftovers, estimate a conservative maximum number of days the food should be kept after cooking for this storage location:
   - room: at most 1 day (often less; many cooked foods should NOT be kept at room temp for long).
   - fridge: usually 1–4 days depending on the food (seafood and rice-based dishes are often shorter).
   - freezer: usually 30–90 days depending on the food; pick a conservative number.

Important:
- Always be conservative (shorter rather than longer).
- If unsure about food type, choose a lower number of days.
- days_after_cooking must be a non-negative whole number.
- expiry_date = cooked_at + days_after_cooking (YYYY-MM-DD).

Return ONLY valid JSON of the form:
{
  "food_name": "short human-friendly description of the dish",
  "category": "broad category e.g. 'meat', 'seafood', 'pasta', 'rice', 'vegetable', 'mixed'",
  "days_after_cooking": number,
  "expiry_date": "YYYY-MM-DD",
  "reason": "very short explanation"
}

If you really cannot identify anything, return:
{
  "food_name": null,
  "category": null,
  "days_after_cooking": 0,
  "expiry_date": "${cookedAtIso}",
  "reason": "Could not identify the food clearly."
}
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
        food_name: parsed.food_name ?? null,
        category: parsed.category ?? null,
        days_after_cooking: Number(parsed.days_after_cooking ?? 0),
        expiry_date: parsed.expiry_date ?? cookedAtIso,
        reason: parsed.reason ?? null,
        cooked_at: cookedAtIso,
        storage: opts.storage,
      };
    } catch (error) {
      console.error('OpenAI cooked-food error:', error);
      throw new InternalServerErrorException(
        'Failed to estimate cooked food expiry',
      );
    }
  }
}
