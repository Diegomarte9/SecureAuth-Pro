// src/middlewares/validate-dto.ts
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction, RequestHandler } from 'express';

export function validateDto<T>(
  dtoClass: new () => T,
  property: 'body' | 'query' | 'params' = 'body'
): RequestHandler {
  return async (req, res, next) => {
    const output = plainToInstance(dtoClass, req[property]);
    const errors = await validate(output as any, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length > 0) {
      const messages = flattenErrors(errors);
      res.status(400).json({ errors: messages });
      return;
    }
    // replace raw payload with validated+transformed object
    if (property === 'query' || property === 'params') {
      Object.assign(req[property], output);
    } else {
      req[property] = output as any;
    }
    next();
  };
}

function flattenErrors(errors: ValidationError[], parentPath = ''): string[] {
  return errors.flatMap(err => {
    const path = parentPath ? `${parentPath}.${err.property}` : err.property;
    if (err.constraints) {
      return Object.values(err.constraints).map(msg => `${path}: ${msg}`);
    }
    return err.children ? flattenErrors(err.children, path) : [];
  });
}
