#!/bin/sh
if [ -z "$1" ]; then
    echo "usage: ./function-deploy.sh <path-to-file> [<runtime>]"
    exit 0
fi
if [ -z "$2" ]; then
    runtime="python3.7"
else
    runtime=$2
fi

name=$(basename $(dirname $1))
echo $name

zip -j lambda_function.zip $1
aws lambda create-function \
    --function-name ${name} \
    --zip-file fileb://lambda_function.zip \
    --handler lambda_function.lambda_handler \
    --runtime ${runtime} \
    --role arn:aws:iam::${ACCOUNT_ID}:role/TraceMeNowRole \
    --timeout 900

rm lambda_function.zip