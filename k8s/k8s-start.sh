../kafka/kafka-start.sh

../fxprcs-balance/k8s/disk-create.sh
kubectl create -f ../fxprcs-balance/k8s/db-service.yml
kubectl create -f ../fxprcs-balance/k8s/db-deployment.yml
kubectl create -f ../fxprcs-balance/k8s/web-service.yml
kubectl create -f ../fxprcs-balance/k8s/web-deployment.yml

../fxprcs-orders/k8s/disk-create.sh
kubectl create -f ../fxprcs-orders/k8s/db-service.yml
kubectl create -f ../fxprcs-orders/k8s/db-deployment.yml
kubectl create -f ../fxprcs-orders/k8s/web-service.yml
kubectl create -f ../fxprcs-orders/k8s/web-deployment.yml


../fxprcs-main/k8s/disk-create.sh
kubectl create -f ../fxprcs-main/k8s/db-service.yml
kubectl create -f ../fxprcs-main/k8s/db-deployment.yml
kubectl create -f ../fxprcs-main/k8s/web-service.yml
kubectl create -f ../fxprcs-main/k8s/web-deployment.yml

