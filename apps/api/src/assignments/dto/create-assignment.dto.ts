import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  technicianId: string;

  @IsUUID()
  @IsNotEmpty()
  serviceRequestId: string;
}
