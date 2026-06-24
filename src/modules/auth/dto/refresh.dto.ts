import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'Refresh token nhận được khi đăng nhập' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
