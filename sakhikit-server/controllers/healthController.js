// Controller for health-check endpoints
// These tell the client (and monitoring tools) whether the server is alive

export const getHealth = (req, res) => {
  res.json({
    message: 'SakhiKit API is running',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};