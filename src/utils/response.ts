import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: any,
  data: T,
  message = 'Success',
  statusCode = 200
) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: any,
  message = 'Internal server error',
  statusCode = 500,
  errors?: any
) => {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
  };
  return res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
  res: any,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Success'
) => {
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    message,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
  return res.status(200).json(response);
};
