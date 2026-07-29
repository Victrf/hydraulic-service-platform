import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateReportDto {
  @IsString()
  serviceRequestId: string;

  // Inspection

  @IsOptional()
  @IsString()
  findings?: string;

  @IsOptional()
  @IsString()
  rootCause?: string;

  @IsOptional()
  @IsString()
  workPerformed?: string;

  @IsOptional()
  @IsString()
  recommendations?: string;

  // Completion Checklist

  @IsOptional()
  @IsBoolean()
  equipmentTested?: boolean;

  @IsOptional()
  @IsBoolean()
  operational?: boolean;

  @IsOptional()
  @IsBoolean()
  customerInformed?: boolean;

  @IsOptional()
  @IsBoolean()
  areaCleaned?: boolean;

  @IsOptional()
  @IsBoolean()
  safetyChecks?: boolean;

  @IsOptional()
  @IsBoolean()
  customerAccepted?: boolean;

  // Time Tracking

  @IsOptional()
  @IsDateString()
  startedAt?: Date;

  @IsOptional()
  @IsDateString()
  completedAt?: Date;
}
