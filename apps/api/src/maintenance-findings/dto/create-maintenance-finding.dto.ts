import { IsOptional, IsString } from 'class-validator';

export class CreateMaintenanceFindingDto {
  @IsString()
  problem: string;

  @IsOptional()
  @IsString()
  cause?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  recommendation?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
