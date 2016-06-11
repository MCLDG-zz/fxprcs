gcloud container \
 --project "fxprcs" \
 clusters create "fxprcs-cluster" \
 --zone "asia-east1-a" \
 --machine-type "n1-standard-1" \
 --num-nodes "2" \
 --network "default"
