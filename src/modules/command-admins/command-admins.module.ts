import { Module } from '@nestjs/common';
import { CommandAdminsController } from './command-admins.controller';
import { CommandAdminsService } from './command-admins.service';

@Module({
  imports: [],
  exports: [
    CommandAdminsService
  ],
  providers: [
    CommandAdminsService
  ],
  controllers: [
    CommandAdminsController,
  ]
})

export class CommandAdminsModule { }
