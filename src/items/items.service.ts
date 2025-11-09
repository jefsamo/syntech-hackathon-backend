/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/items/items.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, ItemDocument } from './schemas/item.schema';
import { CreateItemDto } from './dtos/create-item.dto';
import { LeaderboardEntryDto } from './dtos/leaderboard-entry.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name) private readonly itemModel: Model<ItemDocument>,
  ) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    const created = new this.itemModel(createItemDto);
    return created.save();
  }

  async getLeaderboard(limit = 10): Promise<LeaderboardEntryDto[]> {
    const results = await this.itemModel
      .aggregate([
        {
          $group: {
            _id: '$username',
            itemCount: { $sum: 1 },
          },
        },
        {
          $sort: {
            itemCount: -1,
          },
        },
        {
          $limit: limit,
        },
      ])
      .exec();

    return results.map((r) => ({
      username: r._id,
      itemCount: r.itemCount,
    }));
  }

  async getUserItemCount(username: string): Promise<number> {
    return this.itemModel.countDocuments({ username }).exec();
  }

  async getUserItems(username: string) {
    return this.itemModel.find({ username }).sort({ createdAt: -1 }).exec();
  }
}
