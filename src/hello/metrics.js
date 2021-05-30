const { createMetricsLogger, Unit } = require("aws-embedded-metrics");

exports.withCountMetric = (metricName, wrappedFunction) => {
  return async (...args) => {
    const metrics = createMetricsLogger();
    try {
      return await wrappedFunction(...args);
    } catch (err) {
      throw err;
    } finally {
      metrics.putMetric(metricName, 1.0, Unit.Count);
      await flush(metrics);
    }
  };
};

async function flush(metrics) {
  try {
    await metrics.flush();
  } catch (err) {
    console.log("Error flushing metrics", err);
  }
}
