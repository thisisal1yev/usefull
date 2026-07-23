import { IsIn, IsUUID } from 'class-validator'

export class CreateReportDto {
  @IsIn(['question', 'answer'])
  targetType!: 'question' | 'answer'

  @IsUUID()
  targetId!: string
}
