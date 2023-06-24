import { IProtocolSource } from '../interfaces/protocolSource.interface';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProjectId } from '../../project/interfaces/project.interface';
import { Project } from '../../project/entities/project.entity';

@Entity({ name: 'protocol_source' })
export class ProtocolSource implements IProtocolSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column('jsonb', { nullable: false })
  config: object;

  @Column({ name: 'project_id' })
  projectId: ProjectId;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
