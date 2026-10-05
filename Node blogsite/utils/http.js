function buildSuccessResponse(data, message = 'Success') {
  return {
    success: true,
    message,
    data
  };
}

function buildErrorResponse(message, error = null) {
  const payload = {
    success: false,
    message
  };

  if (error !== null && error !== undefined) {
    payload.error = error;
  }

  return payload;
}

module.exports = {
  buildSuccessResponse,
  buildErrorResponse
};
