import { IsString, IsUUID, MinLength } from 'class-validator'

export class AssignCoachDto {
  @IsUUID()
  learnerId!: string

  @IsString()
  @MinLength(2)
  coachUsername!: string
}
