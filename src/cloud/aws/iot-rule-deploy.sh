if [ -z "$1" ] && [ -z "$2" ] && [ -z "$3" ]; then
    echo "usage: ./iot-rule-deploy.sh <rule-name> <function-name> <topic>"
    exit 0
fi

rule=$1
function=$2
topic=$3

./iot-rules/create-rule.sh ${rule} ${function} ${topic}
aws iot create-topic-rule --rule-name ${rule} --topic-rule-payload file://iot-rules/${rule}.json
aws lambda add-permission --function-name ${function} --region ${AWS_REGION} --principal iot.amazonaws.com --source-arn arn:aws:iot:${AWS_REGION}:${ACCOUNT_ID}:rule/${rule} --source-account ${ACCOUNT_ID} --statement-id 1 --action "lambda:InvokeFunction"