import { Test, TestingModule } from '@nestjs/testing';
import { ExpiryController } from './expiry.controller';

describe('ExpiryController', () => {
  let controller: ExpiryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpiryController],
    }).compile();

    controller = module.get<ExpiryController>(ExpiryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
