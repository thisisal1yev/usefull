import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateExamQuestionDto {
  @IsIn(['Part 1', 'Part 2', 'Part 3'])
  part!: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  topic?: string

  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  question!: string
}
