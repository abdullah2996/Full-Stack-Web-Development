import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

export interface CartItem {
  productId: number;
  quantity: number;
}

@Injectable()
export class CartService {
  // one shared cart (no users / login in this project)
  private items: CartItem[] = [];

  constructor(private readonly productsService: ProductsService) {}

  // returns cart with product details + totals (coupon is optional)
  getCart(coupon?: string) {
    const items = this.items.map((item) => {
      const product = this.productsService.findOne(item.productId);
      return {
        productId: product.id,
        name: product.name,
        category: product.category,
        emoji: product.emoji,
        price: product.price,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity,
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const discount = coupon && coupon.toUpperCase() === 'NILA10' ? Math.round(subtotal * 0.1) : 0;

    return {
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      discount,
      delivery: 0,
      total: subtotal - discount,
    };
  }

  addItem(body: any) {
    const quantity = body.quantity ? Number(body.quantity) : 1;
    if (quantity < 1 || quantity > 10) {
      throw new BadRequestException('Quantity must be between 1 and 10');
    }
    const product = this.productsService.findOne(Number(body.productId));
    const existing = this.items.find((i) => i.productId === product.id);

    const newQty = (existing ? existing.quantity : 0) + quantity;
    if (newQty > product.stock) {
      throw new BadRequestException(`Only ${product.stock} in stock`);
    }

    if (existing) {
      existing.quantity = newQty;
    } else {
      this.items.push({ productId: product.id, quantity });
    }
    return this.getCart();
  }

  updateItem(productId: number, body: any) {
    const item = this.items.find((i) => i.productId === productId);
    if (!item) {
      throw new NotFoundException('Item is not in the cart');
    }
    const quantity = Number(body.quantity);
    if (quantity < 1 || quantity > 10) {
      throw new BadRequestException('Quantity must be between 1 and 10');
    }
    item.quantity = quantity;
    return this.getCart();
  }

  removeItem(productId: number) {
    if (!this.items.find((i) => i.productId === productId)) {
      throw new NotFoundException('Item is not in the cart');
    }
    this.items = this.items.filter((i) => i.productId !== productId);
    return this.getCart();
  }

  clear() {
    this.items = [];
    return this.getCart();
  }
}
