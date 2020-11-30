#!/bin/sh
aws dynamodb create-table --cli-input-json file://dynamodb/globalStatus.json
aws iam create-role --role-name TraceMeNowRole --assume-role-policy-document file://trust-policy/trust-policy.json
aws iam create-policy --policy-name TraceMeNowPolicy --policy-document file://policies/trace-me-now-policy.json
aws iam attach-role-policy --role-name TraceMeNowRole --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/TraceMeNowPolicy

sleep 1

./function-deploy.sh default-functions/newDevice/lambda_function.py
./api-deploy.sh newDevice newDevice "POST"
./iot-rule-deploy.sh "newDeviceRule" "newDevice" "device/new"

./function-deploy.sh default-functions/getDevices/lambda_function.py
./api-deploy.sh getDevices getDevices "GET"

./function-deploy.sh default-functions/getDevice/lambda_function.py
./api-deploy.sh getDevice getDevice "POST"

./function-deploy.sh default-functions/getDeviceLocation/lambda_function.py
./api-deploy.sh getDeviceLocation getDeviceLocation "POST"
./iot-rule-deploy.sh "deviceLocationRule" "getDeviceLocation" "device/location"

./function-deploy.sh default-functions/updateDevices/lambda_function.py
./api-deploy.sh updateDevices updateDevices "POST"
./iot-rule-deploy.sh "updateDeviceRule" "updateDevices" "device/update"

./function-deploy.sh default-functions/deleteDevice/lambda_function.py
./api-deploy.sh deleteDevice deleteDevice "POST"
./iot-rule-deploy.sh "deleteDeviceRule" "deleteDevice" "device/delete"

aws iot create-thing --thing-name RaspberryPi
cert_arn=$(aws iot create-keys-and-certificate --set-as-active --certificate-pem-outfile raspberry_certificate.pem.crt --public-key-outfile raspberry_public_key.pem --private-key-outfile raspberry_private_key.pem --query 'certificateArn' --output text)
aws iot create-policy --policy-name RaspberryPiPolicy --policy-document file://policies/raspberry-pi-policy.json
aws iot attach-policy --target ${cert_arn} --policy-name RaspberryPiPolicy
aws iot attach-thing-principal --principal ${cert_arn} --thing-name RaspberryPi