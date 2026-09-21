export function getApiErrorMessage(error: unknown, fallback: string) {
  const apiError = error as {
    data?: {
      statusMessage?: string;
      message?: string;
    };
    statusMessage?: string;
    message?: string;
    response?: {
      _data?: {
        statusMessage?: string;
        message?: string;
      };
    };
  };

  return (
    apiError?.data?.message ||
    apiError?.data?.statusMessage ||
    apiError?.response?._data?.message ||
    apiError?.response?._data?.statusMessage ||
    apiError?.statusMessage ||
    apiError?.message ||
    fallback
  );
}
