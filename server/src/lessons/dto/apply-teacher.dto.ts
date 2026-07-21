import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator'
export class ApplyTeacherDto {
  @IsString() @MinLength(10) @MaxLength(1000) bio!: string
  @IsOptional() @IsString() @MaxLength(500) experience?: string
  @IsOptional() @IsUrl() certificatesUrl?: string
}
