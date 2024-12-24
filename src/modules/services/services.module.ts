import { Module } from "@nestjs/common";
import { ServicesController } from "./services.controller";
import { ServicesService } from "./services.service";

@Module({
  imports: [],
  exports: [ServicesService],
  providers: [ServicesService],
  controllers: [ServicesController]
})

export class ServicesModule {}
