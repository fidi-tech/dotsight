import { ProtocolId } from '../interfaces/protocol.interface';
import { ApiProperty } from '@nestjs/swagger';

export class ProtocolResponseDto {
  @ApiProperty()
  id: ProtocolId;
  @ApiProperty()
  description: string | null;
  @ApiProperty()
  logo: string | null;
  @ApiProperty()
  name: string;
  @ApiProperty()
  website: string | null;
}
