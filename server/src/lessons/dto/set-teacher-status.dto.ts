import { IsIn } from 'class-validator'
export class SetTeacherStatusDto {
  @IsIn(['approved', 'rejected']) status!: 'approved' | 'rejected'
}
