import { ApiProperty } from '@nestjs/swagger';

export class Web3LoginDto {
  @ApiProperty({
    description: 'web3 address',
  })
  address: string;

  @ApiProperty({
    description: 'some random login message',
  })
  msg: string;

  @ApiProperty({
    description: 'message signature',
  })
  signed: string;
}
