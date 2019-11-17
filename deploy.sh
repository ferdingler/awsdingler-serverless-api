sam deploy --template-file ./packaged.yaml \
--stack-name awsdingler-api \
--capabilities CAPABILITY_IAM \
--parameter-overrides \
KubeSpotFleetId=replacethis \
UptimeRobotApiKey=replacethis \
UptimeRobotMonitorId=replacethis


{"AutoScalingGroupName": "eksctl-awsdingler-k8s-nodegroup-nodegroup-1-NodeGroup-13PQNMASKPXWX","UptimeRobotUrl": "https://api.uptimerobot.com/v2","UptimeRobotApiKey": "u716959-ae1303cfa54c49d466a281c6","UptimeRobotMonitorId": "782321798"}