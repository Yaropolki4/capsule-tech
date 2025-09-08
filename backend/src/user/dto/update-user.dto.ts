import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsInt,
  IsUrl,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  bio?: string;

  @IsOptional()
  @IsInt()
  capsulesQuantity?: number;

  @IsString()
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(200)
  fullName?: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(200)
  name?: string;
}
