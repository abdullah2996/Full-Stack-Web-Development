import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // GET /cart  or  GET /cart?coupon=NILA10
  @Get()
  getCart(@Query('coupon') coupon?: string) {
    return this.cartService.getCart(coupon);
  }

  // POST /cart/items   body: { productId, quantity }
  @Post('items')
  addItem(@Body() body: any) {
    return this.cartService.addItem(body);
  }

  // PATCH /cart/items/3   body: { quantity }
  @Patch('items/:productId')
  updateItem(@Param('productId') productId: string, @Body() body: any) {
    return this.cartService.updateItem(+productId, body);
  }

  // DELETE /cart/items/3
  @Delete('items/:productId')
  removeItem(@Param('productId') productId: string) {
    return this.cartService.removeItem(+productId);
  }

  // DELETE /cart
  @Delete()
  clear() {
    return this.cartService.clear();
  }
}
