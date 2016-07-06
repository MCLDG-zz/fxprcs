kubectl delete -f ../fxprcs-balance/k8s/db-service.yml
kubectl delete -f ../fxprcs-balance/k8s/db-deployment.yml
kubectl delete -f ../fxprcs-balance/k8s/web-service.yml
kubectl delete -f ../fxprcs-balance/k8s/web-deployment.yml
# ../fxprcs-balance/k8s/disk-delete.sh

kubectl delete -f ../fxprcs-orders/k8s/db-service.yml
kubectl delete -f ../fxprcs-orders/k8s/db-deployment.yml
kubectl delete -f ../fxprcs-orders/k8s/web-service.yml
kubectl delete -f ../fxprcs-orders/k8s/web-deployment.yml
# ../fxprcs-orders/k8s/disk-delete.sh

kubectl delete -f ../fxprcs-main/k8s/db-service.yml
kubectl delete -f ../fxprcs-main/k8s/db-deployment.yml
kubectl delete -f ../fxprcs-main/k8s/web-service.yml
kubectl delete -f ../fxprcs-main/k8s/web-deployment.yml
# ../fxprcs-main/k8s/disk-delete.sh

../kafka/kafka-stop.sh
