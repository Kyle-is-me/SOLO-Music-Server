import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  code: number;

  constructor(statusCode: number, code: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
  }
}

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.code,
      data: null,
      message: err.message,
    });
  }

  console.error('Unexpected error:', err);

  return res.status(500).json({
    code: 500,
    data: null,
    message: 'Internal Server Error',
  });
};
