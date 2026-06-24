import { IsArray, IsUUID } from 'class-validator';

export class UpdateUserEquipmentDto {
  @IsArray()
  @IsUUID('all', { each: true })
  equipmentIds!: string[]; // ✅ definite assignment fix
}
