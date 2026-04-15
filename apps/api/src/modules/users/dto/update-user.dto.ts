import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsPhoneNumber,
  IsUrl,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: 'Software engineer with 5 years of experience',
    description: 'User bio',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Bio must be less than 500 characters' })
  bio?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'User avatar URL',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Invalid avatar URL' })
  avatarUrl?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'User phone number',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number' })
  phone?: string;

  @ApiProperty({
    example: 'San Francisco, CA',
    description: 'User location',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Location must be less than 100 characters' })
  location?: string;
}
