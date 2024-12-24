import { PartialType } from '@nestjs/swagger';
import { CreateVehicleServicingDto } from './create-vehicle-servicing.dto';

export class UpdateVehicleServicingDto extends PartialType(CreateVehicleServicingDto) {}
