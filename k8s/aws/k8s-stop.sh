kubectl delete -f ../../fxprcs-balance/k8s/db-service.yml
kubectl delete -f ../../fxprcs-balance/k8s/db-deployment-aws.yml
kubectl delete -f ../../fxprcs-balance/k8s/web-service.yml
kubectl delete -f ../../fxprcs-balance/k8s/web-deployment-aws.yml

kubectl delete -f ../../fxprcs-orders/k8s/db-service.yml
kubectl delete -f ../../fxprcs-orders/k8s/db-deployment-aws.yml
kubectl delete -f ../../fxprcs-orders/k8s/web-service.yml
kubectl delete -f ../../fxprcs-orders/k8s/web-deployment-aws.yml

kubectl delete -f ../../fxprcs-main/k8s/db-service.yml
kubectl delete -f ../../fxprcs-main/k8s/db-deployment-aws.yml
kubectl delete -f ../../fxprcs-main/k8s/web-service.yml
kubectl delete -f ../../fxprcs-main/k8s/web-deployment-aws.yml
