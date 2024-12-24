import { PartialType } from '@nestjs/swagger';
import { CreateApprovedTripDto } from './create-approved-trip.dto';

export class UpdateApprovedTripDto extends PartialType(CreateApprovedTripDto) {}
