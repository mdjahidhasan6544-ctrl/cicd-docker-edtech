export function sendSuccess(res, payload = {}, status = 200) {
  return res.status(status).json({
    success: true,
    ...payload
  });
}

export function sendError(res, message, status = 400, extra = {}) {
  return res.status(status).json({
    success: false,
    message,
    ...extra
  });
}
