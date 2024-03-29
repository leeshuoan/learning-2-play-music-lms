import sys
import boto3
import json

from global_functions.responses import *
from global_functions.exists_in_db import *
from global_functions.cognito import *

def lambda_handler(event, context):

    try:
        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table("LMS")

        courseId = event['queryStringParameters']['courseId']

        # VALIDATION
        # check if <courseId> exists in database
        if not id_exists("Course", "Course", courseId):
            return response_404("courseId does not exist in database")

        if 'teacherId' not in event['queryStringParameters']:
            sortKey = "Teacher#"
        else:
            teacherId = event['queryStringParameters']['teacherId']
            sortKey = "Teacher#" + teacherId

            # check if teacherId exists in Cognito
            teacherId = event['queryStringParameters']['teacherId']
            if not get_user(teacherId):
                return response_404('teacherId does not exist in Cognito')

            # check if <teacherId> has been registered with <courseId>
            if not combination_id_exists("Teacher", teacherId, "Course", courseId):
                return response_404("teacherId is not registered with the course. To do so, please use /user/course to register")

        response = table.query(
            IndexName="SK-PK-index",
            KeyConditionExpression="SK = :SK AND begins_with(PK, :PK)",
            ExpressionAttributeValues={
                ":SK": f"Course#{courseId}",
                ":PK": sortKey
            })

        items = response["Items"]

        return response_200_items(items)

    except Exception as e:
        # print(f".......... 🚫 UNSUCCESSFUL: Failed request for Course ID: {courseId} 🚫 ..........")
        exception_type, exception_object, exception_traceback = sys.exc_info()
        filename = exception_traceback.tb_frame.f_code.co_filename
        line_number = exception_traceback.tb_lineno
        print("❗Exception type: ", exception_type)
        print("❗File name: ", filename)
        print("❗Line number: ", line_number)
        print("❗Error: ", e)

        return response_500(e)
