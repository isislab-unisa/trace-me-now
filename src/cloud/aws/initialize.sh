#!/bin/sh
aws dynamodb create-table --cli-input-json file://dynamodb/globalStatus.json
aws iam create-role --role-name TraceMeNowRole --assume-role-policy-document file://trust-policy/trust-policy.json
aws iam create-policy --policy-name TraceMeNowPolicy --policy-document file://policies/trace-me-now-policy.json
aws iam attach-role-policy --role-name TraceMeNowRole --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/TraceMeNowPolicy
sleep 1
zip -j lambda_function.zip default-functions/newDevice/lambda_function.py
aws lambda create-function --function-name newDeviceee --zip-file fileb://lambda_function.zip --handler lambda_function.lambda_handler --runtime python3.7 --role arn:aws:iam::${ACCOUNT_ID}:role/TraceMeNowRole --timeout 900
./api_deploy.sh newDevice newDeviceee "POST"
rm lambda_function.zip

zip -j lambda_function.zip default-functions/getDevices/lambda_function.py
aws lambda create-function --function-name getDevices1 --zip-file fileb://lambda_function.zip --handler lambda_function.lambda_handler --runtime python3.7 --role arn:aws:iam::${ACCOUNT_ID}:role/TraceMeNowRole --timeout 900
./api_deploy.sh getDevices getDevices1 "GET"
rm lambda_function.zip

zip -j lambda_function.zip default-functions/getDevice/lambda_function.py
aws lambda create-function --function-name getDevice1 --zip-file fileb://lambda_function.zip --handler lambda_function.lambda_handler --runtime python3.7 --role arn:aws:iam::${ACCOUNT_ID}:role/TraceMeNowRole --timeout 900
./api_deploy.sh getDevice getDevice1 "POST"
rm lambda_function.zip

zip -j lambda_function.zip default-functions/getDevicePosition/lambda_function.py
aws lambda create-function --function-name getDevicePosition1 --zip-file fileb://lambda_function.zip --handler lambda_function.lambda_handler --runtime python3.7 --role arn:aws:iam::${ACCOUNT_ID}:role/TraceMeNowRole --timeout 900
./api_deploy.sh getDevicePosition getDevicePosition1 "POST"
rm lambda_function.zip

zip -j lambda_function.zip default-functions/updateDevice/lambda_function.py
aws lambda create-function --function-name updateDevice1 --zip-file fileb://lambda_function.zip --handler lambda_function.lambda_handler --runtime python3.7 --role arn:aws:iam::${ACCOUNT_ID}:role/TraceMeNowRole --timeout 900
./api_deploy.sh updateDevice updateDevice1 "POST"
rm lambda_function.zip

zip -j lambda_function.zip default-functions/deleteDevice/lambda_function.py
aws lambda create-function --function-name deleteDevice1 --zip-file fileb://lambda_function.zip --handler lambda_function.lambda_handler --runtime python3.7 --role arn:aws:iam::${ACCOUNT_ID}:role/TraceMeNowRole --timeout 900
./api_deploy.sh deleteDevice deleteDevice1 "POST"
rm lambda_function.zip