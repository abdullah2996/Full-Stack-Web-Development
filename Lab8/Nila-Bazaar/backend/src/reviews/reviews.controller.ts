import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // GET /reviews  or  GET /reviews?productId=1
  @Get()
  findAll(@Query('productId') productId?: string) {
    return this.reviewsService.findAll(productId);
  }

  // GET /reviews/summary
  @Get('summary')
  summary() {
    return this.reviewsService.summary();
  }

  // POST /reviews
  // body: { productId, userName, rating, comment }
  @Post()
  create(@Body() body: any) {
    return this.reviewsService.create(body);
  }
}
