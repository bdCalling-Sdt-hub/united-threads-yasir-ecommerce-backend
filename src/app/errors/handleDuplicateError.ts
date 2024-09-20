/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSources, TGenericErrorResponse } from "../interface/error";

const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const statusCode = 400;

  const [errorValue] = Object.values(err.keyValue);

  const errorSources: TErrorSources = [
    {
      message: `${errorValue} is already exists`,
      path: "",
    },
  ];

  return {
    statusCode,
    message: `${errorValue} is already exists`,
    errorSources,
  };
};

export default handleDuplicateError;
