import { IsOptional, IsString } from 'class-validator';

export class CompleteMaintenanceVisitDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
