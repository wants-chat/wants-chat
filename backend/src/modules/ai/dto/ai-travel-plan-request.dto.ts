import { IsString, IsNumber, IsDateString, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TravelStyle {
  BUDGET = 'budget',
  BALANCED = 'balanced',
  LUXURY = 'luxury',
  ADVENTURE = 'adventure',
  CULTURAL = 'cultural',
  RELAXATION = 'relaxation'
}

export class AITravelPlanRequestDto {
  @ApiProperty({ 
    description: 'Travel destination city and country', 
    example: 'Paris, France' 
  })
  @IsString()
  destination: string;

  @ApiProperty({ 
    description: 'Total budget in USD', 
    example: 3000,
    minimum: 100
  })
  @IsNumber()
  @Min(100)
  budget: number;

  @ApiProperty({ 
    description: 'Number of days (1-30)', 
    example: 5,
    minimum: 1,
    maximum: 30
  })
  @IsNumber()
  @Min(1)
  @Max(30)
  duration: number;

  @ApiProperty({ 
    description: 'Trip start date (ISO format)', 
    example: '2024-04-15' 
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({ 
    description: 'Travel preference style',
    enum: TravelStyle,
    example: TravelStyle.BALANCED
  })
  @IsEnum(TravelStyle)
  travelStyle: TravelStyle;
}