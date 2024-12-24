// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
// } from '@nestjs/common';
// import { ApprovedTripsService } from './approved-trips.service';
// import { CreateApprovedTripDto } from './dto/create-approved-trip.dto';
// import { UpdateApprovedTripDto } from './dto/update-approved-trip.dto';

// @Controller('approved-trips')
// export class ApprovedTripsController {
//   constructor(private readonly approvedTripsService: ApprovedTripsService) {}

//   @Post()
//   create(@Body() createApprovedTripDto: CreateApprovedTripDto) {
//     return this.approvedTripsService.create(createApprovedTripDto);
//   }

//   @Get()
//   findAll() {
//     return this.approvedTripsService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.approvedTripsService.findOne(+id);
//   }

//   @Patch(':id')
//   update(
//     @Param('id') id: string,
//     @Body() updateApprovedTripDto: UpdateApprovedTripDto,
//   ) {
//     return this.approvedTripsService.update(+id, updateApprovedTripDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.approvedTripsService.remove(+id);
//   }
// }
