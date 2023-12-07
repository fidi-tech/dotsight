import { Entity, PrimaryGeneratedColumn } from 'typeorm';

export type UserId = string;

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: UserId;
}
