import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export type WidgetId = string;

@Entity('widget')
export class Widget {
  @ApiProperty({
    description: "widget's uuid",
  })
  @PrimaryGeneratedColumn('uuid')
  id: WidgetId;

  @ApiProperty({
    description: "widget's user-given name",
  })
  @Column()
  name: string;

  @ApiProperty({
    description: "widget's user-selected category",
  })
  @Column('text')
  category: string;

  @ApiProperty({
    description: "widget's user-selected view",
  })
  @Column()
  view: string;

  @ApiProperty({
    description: "widget's view's user-selected parameters",
  })
  @Column({ type: 'json' })
  viewParameters: object;

  @ApiProperty({
    description: "widget's user-selected subcategories",
  })
  @Column('text', { array: true })
  subcategories: string[];

  @ApiProperty({
    description:
      "widget's user-selected metrics. user can not specify both metrics & metricPreset",
  })
  @Column('uuid', { array: true })
  metrics: string[];

  @ApiProperty({
    description:
      "widget's user-selected metricsPreset. user can not specify both metrics & metricPreset",
  })
  @Column('uuid')
  metricsPreset: string;

  @ManyToOne(() => User)
  createdBy: User;

  @Column('timestamp with time zone', {
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ default: false })
  isPublic: boolean;

  @ApiProperty({
    description: 'if user is allowed to modify the widget',
  })
  canModify: boolean;

  @ApiProperty({
    description: 'if user is allowed to execute the widget',
  })
  canExecute: boolean;
}
