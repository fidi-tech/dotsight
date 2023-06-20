import { IProtocolSource } from '../interfaces/protocolSource.interface';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'protocol_source' })
export class ProtocolSource implements IProtocolSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column('jsonb', { nullable: false })
  config: object;
}
