import { z } from 'zod';

export const createVillageSchema = z.object({
  name: z.string({ required_error: 'Village name is required' }).min(2).max(100).trim(),
  description: z.string({ required_error: 'Description is required' }).min(10).trim(),
  region: z.string({ required_error: 'Geographical/hydrogeological region is required' }).min(3).trim(),
  district: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().default('India'),
  population: z.number().int().positive().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

export const updateVillageSchema = createVillageSchema.partial();

export const villageQuerySchema = z.object({
  search: z.string().optional(),
  region: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  page: z.union([z.string().regex(/^\d+$/).transform(Number), z.number()]).optional().default(1),
  limit: z.union([z.string().regex(/^\d+$/).transform(Number), z.number()]).optional().default(20)
});

export default {
  createVillageSchema,
  updateVillageSchema,
  villageQuerySchema
};
