import { IsNotEmpty, IsString } from 'class-validator';

export class RenewSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  planId: string;
}
