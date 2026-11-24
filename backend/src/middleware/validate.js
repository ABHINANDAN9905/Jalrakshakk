import { ZodError } from 'zod';

/**
 * Higher-order middleware to validate incoming request data against a Zod schema
 * @param {import('zod').ZodSchema} schema 
 * @param {'body'|'query'|'params'} source 
 */
export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req[source]);
      req[source] = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues || error.errors || [];
        const errors = issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }));

        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Validation failed',
          errors
        });
      }
      next(error);
    }
  };
};

export default validate;
