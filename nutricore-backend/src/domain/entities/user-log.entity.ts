import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('user_logs')
@Index(['userId', 'createdAt']) 
export class UserLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 36 }) 
  userId: string;

  @Column({ type: 'varchar', length: 50, nullable: true }) 
  traceId: string; 

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weight: number; 

  @Column({ type: 'int', unsigned: true })
  calories: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fat: number;

  @Column({ type: 'json', nullable: true })
  ai_reasoning: any; 

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  adjustment_score: number; 

  @CreateDateColumn()
  createdAt: Date;
}