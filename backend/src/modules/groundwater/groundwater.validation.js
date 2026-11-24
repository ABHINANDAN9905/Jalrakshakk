import { z } from 'zod';

export const villageGroundwaterParamsSchema = z.object({
  villageId: z.string().uuid({ message: 'villageId must be a valid UUID' })
});

export const groundwaterQuerySchema = z.object({
  page: z.union([z.string().regex(/^\d+$/).transform(Number), z.number()]).optional().default(1),
  limit: z.union([z.string().regex(/^\d+$/).transform(Number), z.number()]).optional().default(20)
});

export default {
  villageGroundwaterParamsSchema,
  groundwaterQuerySchema
};
