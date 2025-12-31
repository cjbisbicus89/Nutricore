import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLog } from '../entities/user-log.entity';

@Injectable()
export class MetabolicLogicService {
  constructor(
    @InjectRepository(UserLog)
    private readonly userLogRepository: Repository<UserLog>,
  ) {}

  async getStagnationAnalysis(userId: string, currentWeight: number) {
    const history = await this.userLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 7,
    });

    if (history.length < 3) {
      return { trend: 'STABLE', isStagnated: false, averageWeight: currentWeight };
    }

    const weights = history.map(log => Number(log.weight));
    const averageWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
    
   
    const diff = Math.abs(currentWeight - averageWeight);
    const isStagnated = diff < 0.3; 

    return {
      trend: currentWeight > averageWeight ? 'UP' : 'DOWN',
      isStagnated,
      averageWeight
    };
  }

  calculateMetabolicRisk(currentFat: number, weight: number): boolean {
    if (weight <= 0) return false;
    return currentFat > (weight * 0.8); 
  }

  isAdjustmentSafe(score: number, sleepHours: number): boolean {
    // Seguridad por estrés metabólico (sueño < 5h)
    if (sleepHours < 5 && Math.abs(score) > 0.5) return false;
    return Math.abs(score) <= 0.8;
  }
}