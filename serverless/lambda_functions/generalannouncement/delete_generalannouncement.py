import sys
import boto3
import json

from global_functions.responses import *
from global_functions.exists_in_db import *

def lambda_handler(event, context):

    try:

        # VALIDATION
        # check if <dateId> exists in database
        dateId = event['queryStringParameters']['dateId']
        if not id_exists("GeneralAnnouncements","Date",dateId):
            return response_404("dateId does not exist in database")

        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table("LMS")

        response = table.delete_item(
            Key= {
                "PK": "GeneralAnnouncements",
                "SK": f"Date#{dateId}"
            }
            )

        return response_200_msg("successfully deleted item")


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