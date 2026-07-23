import { IsIn, IsUUID } from 'class-validator'

export class ModerateDto {
  @IsIn(['question', 'answer'])
  targetType!: 'question' | 'answer'

  @IsUUID()
  targetId!: string
}
