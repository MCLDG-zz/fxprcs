aws --region=us-west-2 ecr create-repository --repository-name cpa/aml_fxprcs-node-main
aws --region=us-west-2 ecr create-repository --repository-name cpa/aml_fxprcs-node-balance
aws --region=us-west-2 ecr create-repository --repository-name cpa/aml_fxprcs-node-balance-sidecar
aws --region=us-west-2 ecr create-repository --repository-name cpa/aml_fxprcs-node-order
aws --region=us-west-2 ecr create-repository --repository-name cpa/aml_fxprcs-mongo-main
aws --region=us-west-2 ecr create-repository --repository-name cpa/aml_fxprcs-mongo-balance
aws --region=us-west-2 ecr create-repository --repository-name cpa/aml_fxprcs-mongo-order

