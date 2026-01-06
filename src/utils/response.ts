import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T | null;
}

export const successResponse = <T>(
  res: Response,
  data?: T | null,
  message = 'Success',
  status = 200,
): Response<ApiResponse<T>> => {
  return res.status(status).json({
    success: true,
    message,
    data: data ?? null,
  });
};

export const errorResponse = <T>(
  res: Response,
  message = 'Internal Server Error',
  status = 500,
  data?: T | null,
): Response<ApiResponse<T>> => {
  return res.status(status).json({
    success: false,
    message,
    data: data ?? null,
  });
};
