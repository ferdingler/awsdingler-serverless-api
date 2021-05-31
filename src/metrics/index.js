const { createMetricsLogger } = require("aws-embedded-metrics");

const LambdaMetrics = createMetricsLogger();

// function withCount(metricName, fn) {
//   return async (...args) => {
//     const metrics = createMetricsLogger();
//     try {
//       return await fn(...args);
//     } catch (err) {
//       throw err;
//     } finally {
//       metrics.putMetric(metricName, 1.0, Unit.Count);
//       await flush(metrics);
//     }
//   };
// }

exports.withMetrics = (handler) => {
  return async (...args) => {
    try {
      return await handler(...args);
    } finally {
      try {
        await LambdaMetrics.flush();
      } catch (err) {
        console.log("Failed to flush EMF metrics");
      }
    }
  };
}

exports.LambdaMetrics = LambdaMetrics;

// const { createMetricsLogger, metricScope, Unit } = require("aws-embedded-metrics");

// const lambdaMetrics = createMetricsLogger();
// exports.LambdaMetrics = lambdaMetrics;

// exports.withCount = (metricName, wrappedFunction) => {
//   return async (...args) => {
//     const metrics = createMetricsLogger();
//     try {
//       return await wrappedFunction(...args);
//     } catch (err) {
//       throw err;
//     } finally {
//       metrics.putMetric(metricName, 1.0, Unit.Count);
//       await flush(metrics);
//     }
//   };
// };

// exports.withLatency = (metricName, wrappedFunction) => {
//   return async (...args) => {
//     const metrics = createMetricsLogger();
//     let start;
//     try {
//       start = Date.now();
//       return await wrappedFunction(...args);
//     } catch (err) {
//       throw err;
//     } finally {
//       const latency = Date.now() - start;
//       metrics.putMetric(metricName, latency, Unit.Milliseconds);
//       await flush(metrics);
//     }
//   };
// };

// exports.withCountAndLatency = (metricName, wrappedFunction) => {
//     return async (...args) => {
//       const metrics = createMetricsLogger();
//       let start;
//       try {
//         start = Date.now();
//         return await wrappedFunction(...args);
//       } catch (err) {
//         throw err;
//       } finally {
//         const latency = Date.now() - start;
//         metrics.putMetric(metricName, latency, Unit.Milliseconds);
//         metrics.putMetric(metricName, 1.0, Unit.Count);
//         await flush(metrics);
//       }
//     };
//   };

// async function flush(metrics) {
//   try {
//     await metrics.flush();
//   } catch (err) {
//     console.log("Error flushing metrics", err);
//   }
// }
