import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

export interface Product {
  id: number;
  name: string;
  category: string;
  city: string;
  price: number;
  stock: number;
  rating: number;
  description: string;
  emoji: string;
}

@Injectable()
export class ProductsService {
  // in-memory "database" (same 10 products as products.html)
  private products: Product[] = [
    { id: 1, name: 'Multani Blue Pottery Vase', category: 'Pottery', city: 'Multan', price: 2800, stock: 12, rating: 4.8, emoji: '🏺', description: 'Hand painted blue pottery vase from Multan.' },
    { id: 2, name: 'Ralli Patchwork Quilt', category: 'Home Decor', city: 'Hala (Sindh)', price: 7500, stock: 5, rating: 4.9, emoji: '🛏️', description: 'Traditional Sindhi ralli quilt, every patch is different.' },
    { id: 3, name: 'Peshawari Chappal', category: 'Footwear', city: 'Peshawar', price: 3200, stock: 20, rating: 4.6, emoji: '👞', description: 'Handmade leather chappal from Peshawar.' },
    { id: 4, name: 'Truck Art Tea Tray', category: 'Home Decor', city: 'Other', price: 1800, stock: 15, rating: 4.7, emoji: '🎨', description: 'Colourful truck art tea tray.' },
    { id: 5, name: 'Kashmiri Embroidered Shawl', category: 'Clothing', city: 'Srinagar / Kashmir', price: 9800, stock: 6, rating: 4.9, emoji: '🧣', description: 'Fine Kashmiri embroidery on a soft shawl.' },
    { id: 6, name: 'Camel Skin Lamp', category: 'Lighting', city: 'Multan', price: 5400, stock: 8, rating: 4.5, emoji: '💡', description: 'Camel skin table lamp, hand painted.' },
    { id: 7, name: 'Block Print Cushion Set', category: 'Home Decor', city: 'Other', price: 2200, stock: 25, rating: 4.4, emoji: '🛋️', description: 'Set of block printed cushion covers.' },
    { id: 8, name: 'Sindhi Ajrak Stole', category: 'Clothing', city: 'Hala (Sindh)', price: 2600, stock: 18, rating: 4.6, emoji: '🧵', description: 'Traditional Sindhi ajrak stole.' },
    { id: 9, name: 'Blue Pottery Mug Pair', category: 'Pottery', city: 'Multan', price: 1400, stock: 30, rating: 4.3, emoji: '☕', description: 'Pair of blue pottery mugs.' },
    { id: 10, name: 'Chinioti Jewellery Box', category: 'Home Decor', city: 'Other', price: 3900, stock: 9, rating: 4.7, emoji: '📦', description: 'Carved wooden jewellery box from Chiniot.' },
  ];

  private nextId = 11;

  findAll(category?: string) {
    if (category) {
      return this.products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase(),
      );
    }
    return this.products;
  }

  findOne(id: number) {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  create(body: any) {
    if (!body.name || body.name.length < 3) {
      throw new BadRequestException('Name must be at least 3 characters');
    }
    if (!body.category || !body.city) {
      throw new BadRequestException('Category and city are required');
    }
    if (!body.price || body.price < 100) {
      throw new BadRequestException('Price must be at least Rs. 100');
    }
    if (!body.description || body.description.length < 20) {
      throw new BadRequestException('Description must be at least 20 characters');
    }

    const product: Product = {
      id: this.nextId++,
      name: body.name,
      category: body.category,
      city: body.city,
      price: Number(body.price),
      stock: Number(body.stock) || 1,
      rating: 0,
      description: body.description,
      emoji: body.emoji || '🎁',
    };
    this.products.push(product);
    return product;
  }

  update(id: number, body: any) {
    const product = this.findOne(id);
    Object.assign(product, body);
    return product;
  }

  remove(id: number) {
    const product = this.findOne(id);
    this.products = this.products.filter((p) => p.id !== id);
    return { message: `Product "${product.name}" deleted` };
  }

  // used by ReviewsService
  setRating(id: number, rating: number) {
    this.findOne(id).rating = rating;
  }
}
