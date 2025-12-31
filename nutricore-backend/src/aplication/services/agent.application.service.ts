import { Injectable, Inject, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import * as crypto from 'crypto';


import { REDIS_CLIENT } from 'src/infrastructure/adapters/redis/redis.provider';
import { UserLog } from '../../domain/entities/user-log.entity';
import { GeminiAdapter } from 'src/infrastructure/adapters/ai/gemini.adapter';
import { CreateLogDto } from '../dtos/create-log.dto';
import { NutritionGateway } from '../gateways/nutrition.gateway';
import { MetabolicLogicService } from '../../domain/services/metabolic-logic.service';

@Injectable()
export class AgentApplicationService {
  private readonly logger = new Logger(AgentApplicationService.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @InjectRepository(UserLog) private readonly logRepository: Repository<UserLog>,
    private readonly gemini: GeminiAdapter,
    private readonly nutritionGateway: NutritionGateway,
    private readonly metabolicLogic: MetabolicLogicService,
  ) {}

  async trackNutrition(userId: string, data: CreateLogDto) {
    const { calories, fat, weight, sleepHours, activityLevel } = data; 
    const key = `user:${userId}:daily`;
    const lockKey = `lock:ai-decision:${userId}`;
    const traceId = crypto.randomUUID();

    try {
      const lockAcquired = await this.redis.set(lockKey, 'locked', 'EX', 300, 'NX');
      if (!lockAcquired) {
        throw new HttpException(
          'Estamos procesando tu última actualización. Reintenta en 5 minutos.',
          HttpStatus.TOO_MANY_REQUESTS
        );
      }

      const currentFat = await this.redis.hincrby(key, 'fat', Math.round(fat));
      await this.redis.hincrby(key, 'calories', Math.round(calories));
      await this.redis.expire(key, 86400); 

      const analysis = await this.metabolicLogic.getStagnationAnalysis(userId, weight);
      const weightTrend = weight - analysis.averageWeight;
      const isStagnant = analysis.isStagnated; 

      const snapshot = {
        userId, currentFat, currentWeight: weight, sleepHours, 
        activityLevel, isStagnant, weightTrend: weightTrend.toFixed(2),
        trend: analysis.trend, averageWeight: analysis.averageWeight.toFixed(2)
      };

      const aiDecision = await this.gemini.generateSmartAdvice(JSON.stringify(snapshot));
      const isSafe = this.metabolicLogic.isAdjustmentSafe(aiDecision.adjustment_score, sleepHours);

      if (currentFat > 60 || aiDecision.urgency_level === 'HIGH' || !isSafe) {
        this.nutritionGateway.sendProactiveAdvice(userId, {
          type: 'PROACTIVE_ADVICE',
          status: !isSafe ? 'ADJUSTMENT_PAUSED' : 'ALERTA_METABOLICA',
          message: !isSafe ? "Pausado por fatiga." : aiDecision.reasoning,
          traceId, suggestion: "Revisar hábitos."
        });
      }

      const log = this.logRepository.create({
        userId, weight, calories, fat,
        ai_reasoning: aiDecision.reasoning,
        adjustment_score: isSafe ? aiDecision.adjustment_score : 0,
        traceId 
      });

      await this.logRepository.save(log);

      return {
        status: (currentFat > 60 || aiDecision.urgency_level === 'HIGH') ? 'ALERTA_METABOLICA' : 'ESTABLE',
        agentMessage: aiDecision.reasoning,
        metaData: { 
          currentFat, isStagnant, traceId, 
          timestamp: new Date().toISOString() 
        }
      };
    } catch (error) {
      if (error.status !== HttpStatus.TOO_MANY_REQUESTS) await this.redis.del(lockKey);
      throw error;
    }
  }

  async getNutritionalHistory(userId: string) {
    const logs = await this.logRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 7, 
    });

    const lastWeight = logs.length > 0 ? Number(logs[0].weight) : 0;
    const analysis = await this.metabolicLogic.getStagnationAnalysis(userId, lastWeight);

    return {
      userId,
      analysis,
      history: logs
    };
  }

 
  async getSuccessTrajectory(userId: string, targetWeight: number) {
    const logs = await this.logRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' }, 
    });

    if (logs.length < 2) {
      return { 
        message: "Registra más días para calcular tu Oráculo de éxito.",
        historyCount: logs.length 
      };
    }

    const firstWeight = Number(logs[0].weight);
    const lastWeight = Number(logs[logs.length - 1].weight);
    const lostSoFar = firstWeight - lastWeight;
    
    // Calculamos la velocidad promedio por registro
    const velocity = lostSoFar / logs.length;
    const kgRemaining = lastWeight - targetWeight;
    const estimatedLogs = velocity > 0 ? Math.ceil(kgRemaining / velocity) : Infinity;

    return {
      userId,
      projection: {
        initialWeight: firstWeight,
        currentWeight: lastWeight,
        targetWeight: targetWeight,
        totalLost: lostSoFar.toFixed(2),
        status: velocity > 0 ? 'ON_TRACK' : 'STALLED', 
        estimatedRemainingLogs: velocity > 0 ? estimatedLogs : 'Ajuste metabólico requerido'
      }
    };
  }
}