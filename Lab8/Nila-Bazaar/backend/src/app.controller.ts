import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  home() {
    return { message: 'Welcome to the Nila Bazaar API' };
  }
}
