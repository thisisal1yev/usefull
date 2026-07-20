import { IsString, MaxLength, MinLength } from 'class-validator'

export class CreateQuestionDto {
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  body!: string
}
