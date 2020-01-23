const s3Export = require('./s3Export');
const dashboardService = require('./dashboardService');

exports.generateDashboardToS3 = async () => {
    const dashboardData = await dashboardService.buildDashboardData();
    return s3Export.toBucket(dashboardData);
};

exports.getDashboard = async () => {
    console.log('Hello puto');
    return dashboardService.buildDashboardData();
};