import { AxiosInstance } from 'axios';
import * as AxiosLogger from 'axios-logger';

export const addLogging = (prefixText: string, instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (request) =>
      // @ts-expect-error https://github.com/hg-pyun/axios-logger/issues/131
      AxiosLogger.requestLogger(request, {
        prefixText,
        data: false,
      }),
    (error) =>
      AxiosLogger.errorLogger(error, {
        prefixText,
      }),
  );
  instance.interceptors.response.use(
    (response) =>
      AxiosLogger.responseLogger(response, {
        prefixText,
        data: false,
      }),
    (error) =>
      AxiosLogger.errorLogger(error, {
        prefixText,
      }),
  );
};
