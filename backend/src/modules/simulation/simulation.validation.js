import { z } from 'zod';

export const runSimulationSchema = z.object({
  villageId: z.string({ required_error: 'villageId must be a valid UUID' }).uuid({ message: 'villageId must be a valid UUID' }),
  scenarioId: z.string().optional(),
  season: z.enum(['Monsoon', 'Post-Monsoon', 'Winter', 'Summer']).optional().default('Monsoon'),
  catchmentAreaM2: z.number().positive().optional().default(5000000),
  rainfallMm: z.number().min(0, 'Rainfall cannot be negative').optional(),
  initialStorageM3: z.number().min(0, 'Initial storage cannot be negative').optional(),
  maxCapacityM3: z.number().positive('Max capacity must be positive').optional(),
  soilType: z.enum(['SANDY_LOAM', 'ALLUVIAL', 'BLACK_COTTON', 'HARD_ROCK', 'CLAYEY']).optional().default('HARD_ROCK'),
  slope: z.enum(['FLAT', 'MODERATE', 'STEEP']).optional().default('MODERATE'),
  crops: z.array(
    z.object({
      crop: z.string().min(1).trim(),
      hectares: z.number().min(0, 'Crop hectares cannot be negative')
    })
  ).optional().default([]),
  irrigationMethod: z.enum(['FLOOD', 'SPRINKLER', 'DRIP']).optional().default('FLOOD'),
  interventions: z.object({
    checkDamsCount: z.number().int().min(0).optional().default(0),
    percolationTanksCount: z.number().int().min(0).optional().default(0),
    farmPondsCount: z.number().int().min(0).optional().default(0),
    rooftopRWHUnits: z.number().int().min(0).optional().default(0)
  }).optional().default({}),
  population: z.number().int().positive().optional(),
  perCapitaLpcd: z.number().positive().optional().default(55),
  simulationDays: z.number().int().positive().optional().default(90),
  chemicalIntensity: z.enum(['LOW', 'MODERATE', 'HIGH']).optional().default('MODERATE'),
  wastewaterManagement: z.enum(['UNTREATED', 'PARTIAL', 'SOAK_PITS', 'TREATMENT']).optional().default('PARTIAL'),
  organicFarming: z.boolean().optional().default(false),
  bioFiltersActive: z.boolean().optional().default(false),
  industrialExtractionM3: z.number().min(0).optional().default(0)
});

export const simulationQuerySchema = z.object({
  villageId: z.string().uuid().optional(),
  page: z.union([z.string().regex(/^\d+$/).transform(Number), z.number()]).optional().default(1),
  limit: z.union([z.string().regex(/^\d+$/).transform(Number), z.number()]).optional().default(20)
});

export const scenarioParamsSchema = z.object({
  scenarioId: z.string().min(1, 'scenarioId parameter is required')
});
