import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  Unique,
  ManyToOne,
} from 'typeorm';
import { IProject } from '../interfaces/project.interface';
import { Actor } from '../../actor/entities/actor.entity';
import { ActorId } from '../../actor/interfaces/actor.interface';

@Entity({ name: 'project' })
@Unique(['name'])
export class Project implements IProject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'created_by' })
  createdBy: ActorId;

  @ManyToOne(() => Actor)
  @JoinColumn({ name: 'created_by' })
  creator: Actor;
}
