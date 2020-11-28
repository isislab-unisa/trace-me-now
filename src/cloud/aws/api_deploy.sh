#!/bin/sh
post="POST"
stage_name="tracemenow"
api_name=$1
function_name=$2
method=$3
api_id=$(aws apigateway create-rest-api --name $api_name --query 'id' --output text)
echo $api_id
resource_id=$(aws apigateway get-resources --rest-api-id $api_id --query 'items' --output text)
resource_id=${resource_id::-2}
echo $resource_id
result_id=$(aws apigateway create-resource --rest-api-id $api_id --parent-id $resource_id --path-part $api_name --query 'id' --output text)
echo $result_id

aws apigateway put-method \
    --rest-api-id $api_id \
    --region $AWS_REGION \
    --resource-id $result_id \
    --http-method $method \
    --authorization-type "NONE"

aws apigateway put-integration \
    --region $AWS_REGION \
    --rest-api-id $api_id \
    --resource-id $result_id \
    --http-method $method \
    --integration-http-method POST \
    --type AWS \
    --uri arn:aws:apigateway:$AWS_REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$AWS_REGION:$ACCOUNT_ID:function:${function_name}/invocations \

aws apigateway put-integration-response \
    --region $AWS_REGION \
    --rest-api-id $api_id \
    --resource-id $result_id \
    --http-method $method \
    --status-code 200 \
    --response-templates '{"application/json": ""}' \
    --selection-pattern ""

aws apigateway put-method-response \
    --region $AWS_REGION \
    --rest-api-id $api_id \
    --resource-id $result_id \
    --http-method $method \
    --response-models '{"application/json": "Empty"}' \
    --status-code 200 

aws lambda add-permission \
    --region $AWS_REGION \
    --function-name ${function_name} \
    --action lambda:InvokeFunction \
    --statement-id AllowGatewayToInvokeFunction \
    --principal apigateway.amazonaws.com

aws apigateway create-deployment --rest-api-id $api_id --stage-name $stage_name

echo "API: /${api_name}" >> apis.txt
echo "  - Method: ${method}" >> apis.txt
echo "  - At: https://${api_id}.execute-api.${AWS_REGION}.amazonaws.com/${stage_name}/${api_name}" >> apis.txt
echo "" >> apis.txt