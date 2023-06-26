import { ApiProperty } from '@nestjs/swagger';
import { ProtocolResponseDto } from './protocol.response.dto';

export class ProtocolsResponseDto {
  @ApiProperty({ isArray: true, type: ProtocolResponseDto })
  protocols: ProtocolResponseDto[];

  constructor(protocols) {
    this.protocols = protocols;
  }
}
