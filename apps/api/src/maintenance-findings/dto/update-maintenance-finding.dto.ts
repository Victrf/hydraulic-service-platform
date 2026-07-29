import { PartialType } from '@nestjs/mapped-types';
import { CreateMaintenanceFindingDto } from './create-maintenance-finding.dto';

export class UpdateMaintenanceFindingDto extends PartialType(
  CreateMaintenanceFindingDto,
) {}
