import { IsString, IsOptional } from 'class-validator';

export class CreateServiceRequestDto {
  @IsString()
  description: string;

  @IsString()
  equipmentId: string;

  @IsOptional()
  @IsString()
  location?: string;
}
