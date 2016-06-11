docker tag mcdg/node-main asia.gcr.io/fxprcs/fxprcs-node-main:v1
docker tag mcdg/node-balance asia.gcr.io/fxprcs/fxprcs-node-balance:v1
docker tag mcdg/node-order asia.gcr.io/fxprcs/fxprcs-node-order:v1
docker tag mcdg/news asia.gcr.io/fxprcs/fxprcs-news:v1

docker tag mcdg/mongo-main asia.gcr.io/fxprcs/fxprcs-mongo-main:v1
docker tag mcdg/mongo-balance asia.gcr.io/fxprcs/fxprcs-mongo-balance:v1
docker tag mcdg/mongo-order asia.gcr.io/fxprcs/fxprcs-mongo-order:v1

gcloud docker push asia.gcr.io/fxprcs/fxprcs-node-main:v1
gcloud docker push asia.gcr.io/fxprcs/fxprcs-node-balance:v1
gcloud docker push asia.gcr.io/fxprcs/fxprcs-node-order:v1
gcloud docker push asia.gcr.io/fxprcs/fxprcs-news:v1

gcloud docker push asia.gcr.io/fxprcs/fxprcs-mongo-main:v1
gcloud docker push asia.gcr.io/fxprcs/fxprcs-mongo-balance:v1
gcloud docker push asia.gcr.io/fxprcs/fxprcs-mongo-order:v1

