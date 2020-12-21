#!/bin/sh
rule=$1
function=$2
topic=$3
{
    echo "{"
    echo "    \"sql\": \"SELECT * FROM ${topic}\"", 
    echo "    \"description\": \"This is a rule for the ${function} lambda function.\"",
    echo "    \"ruleDisabled\": false", 
    echo "    \"awsIotSqlVersion\": \"2016-03-23\"",
    echo "    \"actions\": ["
    echo "        {"
    echo "            \"lambda\": {"
    echo "                \"functionArn\": \"arn:aws:lambda:${AWS_REGION}:${ACCOUNT_ID}:function:${function}\""
    echo "            }"
    echo "        }"
    echo "    ]"
    echo "}"
} >> iot-rules/${rule}.json