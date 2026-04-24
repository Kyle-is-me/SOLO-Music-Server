export const success = (data: any, message = 'success') => ({
  code: 0,
  data,
  message,
});

export const error = (code: number, message: string) => ({
  code,
  data: null,
  message,
});
