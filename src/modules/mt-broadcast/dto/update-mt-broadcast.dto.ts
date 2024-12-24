import { PartialType } from '@nestjs/swagger';
import { CreateMtBroadcastDto } from './create-mt-broadcast.dto';

export class UpdateMtBroadcastDto extends PartialType(CreateMtBroadcastDto) {}
