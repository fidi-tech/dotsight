import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

export type CredentialId = string;

@Entity('credential')
@Unique(['issuer', 'subjectId'])
export class Credential {
  @PrimaryGeneratedColumn('uuid')
  id: CredentialId;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'issuer' })
  issuer: string;

  @Column({ name: 'subject_id' })
  subjectId: string;
}
