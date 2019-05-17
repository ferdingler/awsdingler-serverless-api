sam deploy --template-file ./packaged.yaml \
--stack-name awsdingler-api \
--capabilities CAPABILITY_IAM \
--parameter-overrides \
KubeSpotFleetId=replacethis \
UptimeRobotApiKey=replacethis \
UptimeRobotMonitorId=replacethis
