import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { CommandsController } from './commands.controller';
import { CommandsService } from './commands.service';

@Module({
  imports: [ServicesModule],
  exports: [CommandsService],
  providers: [CommandsService],
  controllers: [CommandsController],
})

export class CommandsModule { }
