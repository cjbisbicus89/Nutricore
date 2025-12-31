import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus'; 

import { MySqlProvider } from './infrastructure/persistence/mysql.provider';
import { RedisModule } from './infrastructure/adapters/redis/redis.module';
import { GeminiAdapter } from './infrastructure/adapters/ai/gemini.adapter';
import { AgentApplicationService } from './application/services/agent.application.service';
import { UserLog } from './domain/entities/user-log.entity';
import { MetabolicLogicService } from './domain/services/metabolic-logic.service';
import { HealthController } from './health.controller'; 
import { AgentController } from './application/controllers/agent.controller'; 
import { NutritionGateway } from './application/gateways/nutrition.gateway'; 

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MySqlProvider, 
    TypeOrmModule.forFeature([UserLog]), 
    RedisModule,
    TerminusModule,
  ],
  controllers: [HealthController, AgentController],
  providers: [
    AgentApplicationService, 
    MetabolicLogicService, 
    NutritionGateway, // Registro del Gateway para habilitar WebSockets
    {
      provide: 'IAiProvider', 
      useClass: GeminiAdapter,
    },
    GeminiAdapter, 
  ],
})
export class AppModule {}