import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';

export interface Order {
  id: number;
  customer: { name: string; phone: string; address: string; city: string; zip?: string };
  payment: string;
  items: any[];
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  createdAt: string;
}

@Injectable()
export class OrdersService {
  private orders: Order[] = [];
  private nextId = 1001;

  constructor(
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
  ) {}

  create(body: any) {
    if (!body.name || !body.address || !body.city) {
      throw new BadRequestException('Name, address and city are required');
    }
    if (!/^03[0-9]{2}-?[0-9]{7}$/.test(body.phone || '')) {
      throw new BadRequestException('Use a Pakistani number like 0300-1234567');
    }
    if (!['cod', 'jazz', 'easy', 'card'].includes(body.payment)) {
      throw new BadRequestException('Choose a valid payment method');
    }

    const cart = this.cartService.getCart(body.coupon);
    if (cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    // check stock first, then reduce it
    for (const item of cart.items) {
      const product = this.productsService.findOne(item.productId);
      if (item.quantity > product.stock) {
        throw new BadRequestException(`Not enough stock for ${product.name}`);
      }
    }
    for (const item of cart.items) {
      const product = this.productsService.findOne(item.productId);
      this.productsService.update(product.id, { stock: product.stock - item.quantity });
    }

    const order: Order = {
      id: this.nextId++,
      customer: { name: body.name, phone: body.phone, address: body.address, city: body.city, zip: body.zip },
      payment: body.payment,
      items: cart.items,
      subtotal: cart.subtotal,
      discount: cart.discount,
      total: cart.total,
      status: 'Placed',
      createdAt: new Date().toISOString(),
    };
    this.orders.push(order);

    this.cartService.clear();
    return order;
  }

  findAll() {
    return this.orders;
  }

  findOne(id: number) {
    const order = this.orders.find((o) => o.id === id);
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return order;
  }
}
