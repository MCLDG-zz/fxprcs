for image in $(kubectl get pods --all-namespaces --output=jsonpath='{..image}')
do
    echo $image
done
