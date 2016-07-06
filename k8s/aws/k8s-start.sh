kubectl create -f ../../fxprcs-balance/k8s/db-service.yml
kubectl create -f ../../fxprcs-balance/k8s/db-deployment-aws.yml
kubectl create -f ../../fxprcs-balance/k8s/web-service.yml
kubectl create -f ../../fxprcs-balance/k8s/web-deployment-aws.yml

kubectl create -f ../../fxprcs-orders/k8s/db-service.yml
kubectl create -f ../../fxprcs-orders/k8s/db-deployment-aws.yml
kubectl create -f ../../fxprcs-orders/k8s/web-service.yml
kubectl create -f ../../fxprcs-orders/k8s/web-deployment-aws.yml

kubectl create -f ../../fxprcs-main/k8s/db-service.yml
kubectl create -f ../../fxprcs-main/k8s/db-deployment-aws.yml
kubectl create -f ../../fxprcs-main/k8s/web-service.yml
kubectl create -f ../../fxprcs-main/k8s/web-deployment-aws.yml

