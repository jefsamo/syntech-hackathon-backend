/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/items/items.controller.ts
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dtos/create-item.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  // POST /api/items
  @Post()
  async createItem(@Body() body: CreateItemDto) {
    const item = await this.itemsService.create(body);
    return {
      success: true,
      itemId: item._id,
    };
  }

  // GET /api/items/leaderboard?limit=10
  @Get('leaderboard')
  async leaderboard(@Query('limit') limit?: string) {
    const lim = limit ? parseInt(limit, 10) || 10 : 10;
    const entries = await this.itemsService.getLeaderboard(lim);
    return { entries };
  }

  // GET /api/items/user?username=John
  @Get('user')
  async userItems(@Query('username') username: string) {
    const items = await this.itemsService.getUserItems(username);
    return { items };
  }

  // GET /api/items/user-count?username=John
  @Get('user-count')
  async userCount(@Query('username') username: string) {
    const count = await this.itemsService.getUserItemCount(username);
    return { username, count };
  }
}
