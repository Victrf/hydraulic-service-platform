import { IsString } from 'class-validator';

export class CreateAdminSubscriptionDto {
  @IsString()
  companyId: string;

  @IsString()
  userId: string;

  @IsString()
  equipmentId: string;

  @IsString()
  planId: string;
}
