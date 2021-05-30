const { metricScope, Unit } = require("aws-embedded-metrics");

exports.withCountMetric = async (metricName, wrappedFunction) => {
    return metricScope((metrics) => {
        metrics.setNamespace("Dingler");
        metrics.putMetric(metricName, 1.0, Unit.Count);
        return wrappedFunction;
    });
};
