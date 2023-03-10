import base64
import boto3
import json
import uuid
import os

from global_functions.responses import *

def lambda_handler(event, context): 

    dynamodb = boto3.resource('dynamodb')
    table_name = "LMS"
    table = dynamodb.Table(table_name)
    random_uuid = str(uuid.uuid4().int)[:8]

    try:
        request_body = json.loads(event['body'])
        if not request_body["homeworkContent"].strip() and request_body['homeworkAttachment'] == "":
            raise Exception("Both content and attachment cannot be empty!")

        course_id = request_body['courseId']
        quiz_title = request_body['quizTitle']
        quiz_max_attempts = request_body['quizMaxAttempts']
        quiz_id = random_uuid

        item = {
            "PK": f"Course#{course_id}",
            "SK": f"Quiz#{quiz_id}",
            "QuizTitle": quiz_title,
            "QuizMaxAttempts": quiz_max_attempts
        }

        table.put_item(Item = item)

        return response_202_msg(f"Quiz successfully created with id {quiz_id}")

    except Exception as e:
        return response_400(str(e))