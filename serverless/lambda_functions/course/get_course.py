import sys
import boto3
import json

from global_functions.responses import *
from global_functions.exists_in_db import *
from global_functions.cognito import *

def lambda_handler(event, context):

    try:

        # VALIDATION
        # check if <courseId> is being passed in
        courseId = event['queryStringParameters']
        if courseId is None or courseId == "null":
            sortKey = "Course#"
        else:
            courseId = event['queryStringParameters']['courseId']
            sortKey = "Course#" + courseId

            # VALIDATION
            # check if <courseId> exists in database
            if not id_exists("Course", "Course", courseId):
                return response_404("courseId does not exist in database")

        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table("LMS")

        response = table.query(
            KeyConditionExpression="PK = :PK AND begins_with(SK, :SK)",
            ExpressionAttributeValues={
                ":PK": "Course",
                ":SK": sortKey
            }
            )

        items = response["Items"]

        # add teacher's name
        for item in items:
            teacherId = item['TeacherId']
            teacherName = get_user(teacherId)['teacherName']
            item['TeacherName'] = teacherName

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
