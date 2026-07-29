import { IsString, IsEmail, IsOptional, IsArray, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsIn(['admin', 'technician', 'customer'])
  role!: 'admin' | 'technician' | 'customer';

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipmentIds?: string[];

  @IsOptional()
  @IsString()
  profileImage?: string;
}
