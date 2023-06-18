import { IProtocolSource } from '../interfaces/protocolSource.interface';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SourcesServiceType } from '../sources/sources.service';

@Entity({ name: 'protocol_source' })
export class ProtocolSource implements IProtocolSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: SourcesServiceType,
    nullable: false,
  })
  type: SourcesServiceType;
}
