import { IsNumber, IsString, IsNotEmpty, Min, IsEnum } from 'class-validator';

export enum ActivityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export class CreateLogDto { 
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @Min(0)
  weight: number; 

  @IsNumber()
  @Min(0)
  calories: number;

  @IsNumber()
  @Min(0)
  fat: number;

  @IsNumber()
  @Min(0)
  sleepHours: number;

  @IsEnum(ActivityLevel)
  activityLevel: ActivityLevel;
}