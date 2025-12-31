import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AgentApplicationService } from '../services/agent.application.service';
import { CreateLogDto } from '../dtos/create-log.dto';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentApplicationService) {}

  @Post('log')
  async createLog(@Body() createLogDto: CreateLogDto) {
    return await this.agentService.trackNutrition(createLogDto.userId, createLogDto);
  }

  @Get('history/:userId')
  async getHistory(@Param('userId') userId: string) {
    return await this.agentService.getNutritionalHistory(userId);
  }

  
  @Get('roadmap/:userId/:targetWeight')
  async getRoadmap(
    @Param('userId') userId: string, 
    @Param('targetWeight') targetWeight: string 
  ) {
    return await this.agentService.getSuccessTrajectory(userId, Number(targetWeight));
  }

  @Get('status')
  async getStatus() {
    return { 
      message: 'El agente está activo y observando',
      timestamp: new Date().toISOString()
    };
  }
}