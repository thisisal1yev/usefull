import { IsIn } from 'class-validator'

export class CreateInvoiceDto {
  @IsIn(['premium', 'gold'])
  tier!: 'premium' | 'gold'
}
