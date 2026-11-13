import { Injectable, BadRequestException } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

export interface Review {
  id: number;
  productId: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

@Injectable()
export class ReviewsService {
  private reviews: Review[] = [
    { id: 1, productId: 1, userName: 'Ayesha Khan', rating: 5, comment: 'The colour is even better in person. Packed well, nothing broke on the way to Lahore.', date: '2026-09-12' },
    { id: 2, productId: 3, userName: 'Hamza Ali', rating: 4, comment: 'Very comfortable after a couple of days. Size runs slightly tight, order one up.', date: '2026-09-03' },
    { id: 3, productId: 5, userName: 'Sana Malik', rating: 5, comment: 'Gifted this to my mother and she loved it. The embroidery is very neat.', date: '2026-08-28' },
    { id: 4, productId: 4, userName: 'Bilal Ahmed', rating: 4, comment: 'Looks great in the drawing room. Paint is a little glossy but it suits the style.', date: '2026-08-19' },
    { id: 5, productId: 2, userName: 'Maryam Iqbal', rating: 5, comment: 'Heavy, warm and every patch is different. Worth the price.', date: '2026-08-07' },
  ];
  private nextId = 6;

  constructor(private readonly productsService: ProductsService) {}

  findAll(productId?: string) {
    const list = productId
      ? this.reviews.filter((r) => r.productId === +productId)
      : this.reviews;
    // newest first
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }

  // average + count for the rating box on reviews page
  summary() {
    const count = this.reviews.length;
    const average = count
      ? Math.round((this.reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
      : 0;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    this.reviews.forEach((r) => breakdown[r.rating]++);
    return { count, average, breakdown };
  }

  create(body: any) {
    const product = this.productsService.findOne(Number(body.productId));
    const rating = Number(body.rating);

    if (!body.userName) {
      throw new BadRequestException('Your name is required');
    }
    if (!rating || rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }
    if (!body.comment || body.comment.length < 10) {
      throw new BadRequestException('Review must be at least 10 characters');
    }

    const review: Review = {
      id: this.nextId++,
      productId: product.id,
      userName: body.userName,
      rating,
      comment: body.comment,
      date: new Date().toISOString().slice(0, 10),
    };
    this.reviews.push(review);

    // keep the product rating in sync with its reviews
    const mine = this.reviews.filter((r) => r.productId === product.id);
    const avg = mine.reduce((s, r) => s + r.rating, 0) / mine.length;
    this.productsService.setRating(product.id, Math.round(avg * 10) / 10);

    return review;
  }
}
