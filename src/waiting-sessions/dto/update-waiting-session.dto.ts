import { PartialType } from '@nestjs/mapped-types';
import { CreateWaitingSessionDto } from './create-waiting-session.dto';

export class UpdateWaitingSessionDto extends PartialType(CreateWaitingSessionDto) {}
