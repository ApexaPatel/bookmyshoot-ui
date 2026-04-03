/**
 * Parse error responses from the API (structured plan limits or FastAPI detail).
 */
export async function parseApiError(response) {
  let data = {};
  try {
    data = await response.json();
  } catch {
    return { message: 'Request failed. Please try again.' };
  }

  if (data && data.success === false && data.errorCode) {
    return {
      errorCode: data.errorCode,
      message: data.message || 'Request could not be completed.',
    };
  }

  const detail = data.detail;
  if (typeof detail === 'string') {
    return { message: detail };
  }
  if (detail && typeof detail === 'object' && detail.errorCode) {
    return {
      errorCode: detail.errorCode,
      message: detail.message || 'Request could not be completed.',
    };
  }
  if (Array.isArray(detail) && detail[0]?.msg) {
    return { message: detail[0].msg };
  }

  return { message: data.message || 'Something went wrong.' };
}
