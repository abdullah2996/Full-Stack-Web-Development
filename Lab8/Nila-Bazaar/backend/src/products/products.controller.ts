import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /products  or  GET /products?category=Pottery
  @Get()
  findAll(@Query('category') category?: string) {
    return this.productsService.findAll(category);
  }

  // GET /products/3
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  // POST /products   (Sell with us form)
  // body: { name, category, city, price, stock, description, emoji }
  @Post()
  create(@Body() body: any) {
    return this.productsService.create(body);
  }

  // PUT /products/3
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.productsService.update(+id, body);
  }

  // DELETE /products/3
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
