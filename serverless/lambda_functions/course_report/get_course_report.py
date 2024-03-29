import sys
import boto3
import json

from global_functions.responses import *
from global_functions.exists_in_db import *

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("LMS")


def lambda_handler(event, context):

    try:

        courseId = event['queryStringParameters']['courseId']
        studentId = event['queryStringParameters']['studentId']

        if 'reportId' not in event['queryStringParameters']:
            sortKey = "Student#" + studentId + "Report#"
        else:
            reportId = event['queryStringParameters']['reportId']
            # check of <reportId> exists in database
            sk_name = "Student#" + studentId + "Report"
            if not combination_id_exists("Course", courseId, sk_name, reportId):
                return response_404("reportId is not registered with the course.")

            sortKey = "Student#" + studentId + "Report#" + reportId

        # VALIDATION
        # check if <courseId> exists in database
        if not id_exists("Course", "Course", courseId):
            return response_404("courseId does not exist in database")

        # check if <studentId> has been registered with <courseId>
        if not combination_id_exists("Student", studentId, "Course", courseId):
            return response_404("studentId is not registered with the course. To do so, please use /user/course to register")

        # get report(s) with evaluations for student
        response = table.query(
            KeyConditionExpression="PK = :PK AND begins_with(SK, :SK)",
            ExpressionAttributeValues={
                ":PK": f"Course#{courseId}",
                ":SK": f"{sortKey}"
            })

        print("response")
        print(response)

        items = response['Items']
        print("items")
        print(items)

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
