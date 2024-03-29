import sys
import boto3

from global_functions.responses import *
from global_functions.exists_in_db import *

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("LMS")
# Get all general announcement
def lambda_handler(event, context):
  
    try:
        # VALIDATION
        # check if <DateId> is being passed in
        dateId = event['queryStringParameters']
        if dateId is None or dateId=="null":
            sortKey = "Date#"
        else:
            dateId = event['queryStringParameters']['dateId']
            sortKey = "Date#" + dateId

            # VALIDATION
            # check if <dateId> exists in database
            if not id_exists("GeneralAnnouncements", "Date", dateId):
                return response_404("dateId does not exist in database")

        response = table.query(
            KeyConditionExpression="PK= :PK AND begins_with(SK, :SK)",
            ExpressionAttributeValues={
                ":PK": "GeneralAnnouncements",
                ":SK": sortKey
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