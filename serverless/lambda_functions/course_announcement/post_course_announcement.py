import sys
import boto3
import json
import uuid
from datetime import datetime
import dateutil.tz


from global_functions.responses import *
from global_functions.exists_in_db import *

def lambda_handler(event, context):

    try:
        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table("LMS")
        announcementId = str(uuid.uuid4().hex)[:8]

        sgTimezone = dateutil.tz.gettz('Asia/Singapore')
        date = datetime.now(tz=sgTimezone).strftime("%Y-%m-%dT%H:%M:%S")

        # VALIDATION
        # checks that courseId passed in is not an empty string
        if json.loads(event['body'])['courseId']=="":
            return response_400("courseId is missing")

        # check if <courseId> exists in database
        courseId = json.loads(event['body'])['courseId']
        if not id_exists("Course", "Course", courseId):
            return response_400("courseId does not exist in database")

        response = table.put_item(
            Item={
                "PK": f"Course#{json.loads(event['body'])['courseId']}",
                "SK": f"Announcement#{announcementId}",
                "Content": json.loads(event['body'])['content'],
                "Date": str(date)
            }
            )

        return response_200("successfully inserted item")

    # currently, this is only for functions that sends in request body - to catch 'missing fields' error
    except KeyError:
        print("❗Exception Type Caught - KeyError")
        return response_500("One or more field(s) is missing. Please double check that all fields in the model schema are populated.")

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