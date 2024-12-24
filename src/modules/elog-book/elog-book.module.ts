import { Module } from '@nestjs/common';
import { ElogBookController } from './elog-book.controller';
import { ElogBookService } from './elog-book.service';

@Module({
  providers: [ElogBookService],
  exports: [ElogBookService],
  controllers: [ElogBookController]
})
export class ElogBookModule {}
