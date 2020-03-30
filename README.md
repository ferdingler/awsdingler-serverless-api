# awsdingler-serverless-api

SAM application that serves as backend for www.awsdingler.com. 

## Create a personal stack

Deployment config is found in `samconfig.toml`. This is to run `sam deploy` to create your own personal developer stack. Deployments to DEV and PROD are handled automatically by the pipeline. 

## Run function locally

Examples:

```
sam local invoke KubernetesDashboard \
--event events/k8s.json \
--env-vars env.json
```

```
sam local invoke HelloWorldFunction \
--event events/hello.json \
--env-vars env.json
```

## Pipeline

Pipeline creation can be found under the pipeline/cdk folder. 