docker tag mcdg/node-main 185711092606.dkr.ecr.us-west-2.amazonaws.com/cpa/aml_fxprcs-node-main:v1
docker tag mcdg/node-balance 185711092606.dkr.ecr.us-west-2.amazonaws.com/cpa/aml_fxprcs-node-balance:v1
docker tag mcdg/node-balance-sidecar 185711092606.dkr.ecr.us-west-2.amazonaws.com/cpa/aml_fxprcs-node-balance-sidecar:v1
docker tag mcdg/node-order 185711092606.dkr.ecr.us-west-2.amazonaws.com/cpa/aml_fxprcs-node-order:v1
docker tag mcdg/news 185711092606.dkr.ecr.us-west-2.amazonaws.com/cpa/aml_fxprcs-news:v1

docker tag mcdg/mongo-main 185711092606.dkr.ecr.us-west-2.amazonaws.com/cpa/aml_fxprcs-mongo-main:v1
docker tag mcdg/mongo-balance 185711092606.dkr.ecr.us-west-2.amazonaws.com/cpa/aml_fxprcs-mongo-balance:v1
docker tag mcdg/mongo-order 185711092606.dkr.ecr.us-west-2.amazonaws.com/cpa/aml_fxprcs-mongo-order:v1

docker push 185711092606.dkr.ecr.us-west-2.amazonaws.com/cpa/aml_fxprcs-node-main:v1
docker push 185711092606.dkr.ecr.us-west-2.amazonaws.com/cpa/aml_fxprcs-node-balance:v1
docker push 185711092606.dkr.ecr.us-west-2.amazonaws.com/cpa/aml_fxprcs-node-balance-sidecar:v1
docker push 185711092606.dkr.ecr.us-west-2.amazonaws.com/cpa/aml_fxprcs-node-order:v1
docker push 185711092606.dkr.ecr.us-west-2.amazonaws.com/cpa/aml_fxprcs-news:v1

docker push 185711092606.dkr.ecr.us-west-2.amazonaws.com/cpa/aml_fxprcs-mongo-main:v1
docker push 185711092606.dkr.ecr.us-west-2.amazonaws.com/cpa/aml_fxprcs-mongo-balance:v1
docker push 185711092606.dkr.ecr.us-west-2.amazonaws.com/cpa/aml_fxprcs-mongo-order:v1

