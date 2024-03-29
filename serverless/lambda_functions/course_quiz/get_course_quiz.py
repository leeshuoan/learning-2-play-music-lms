import sys
import boto3
import json
import decimal
import jwt

from global_functions.responses import *

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("LMS")
class Encoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)

def lambda_handler(event, context):

    queryStringParameters: dict = event["queryStringParameters"]
    headers: dict = event["headers"]
    authorization_header = headers.get("Authorization")
    if authorization_header:
        token = authorization_header.split(" ")[-1]

    res = {}
    try:


        courseId = queryStringParameters["courseId"]

        if "studentId" not in queryStringParameters.keys():
            items = handle_general_course_quiz(
                courseId, table, queryStringParameters, token)

        else:
            studentId = queryStringParameters["studentId"]
            items = handle_student_course_quiz(
                courseId, studentId, table, queryStringParameters, token)

        res["statusCode"] = 200
        res["headers"] = {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST,GET,PUT"
        }
        res["body"] = json.dumps(items, cls=Encoder)

        return res

    except Exception as e:
        exception_type, exception_object, exception_traceback = sys.exc_info()

        line_number = exception_traceback.tb_lineno
        print("❗Exception type: ", exception_type)
        print("❗Line number: ", line_number)
        print("❗Error: ", e)
        if exception_type == KeyError:
            return response_404("Id not found")
        return response_500((str(exception_type) + str(e)))


def handle_general_course_quiz(courseId, table, queryStringParameters, token):
    if "quizId" in queryStringParameters.keys():
        quizId = queryStringParameters["quizId"]
        response = table.get_item(
            Key={
                "PK": f"Course#{courseId}",
                "SK": f"Quiz#{quizId}"
            })
        items = response["Item"]

    else:
        filter_expression, expression_values = generate_expression_attribute_values(
            token, courseId)
        response = table.query(
            KeyConditionExpression="PK= :PK AND begins_with(SK, :SK)",
            FilterExpression=filter_expression,
            ExpressionAttributeValues=expression_values

        )
        items = response["Items"]

    return items


def handle_student_course_quiz(courseId, studentId, table, queryStringParameters, token):
    if "quizId" in queryStringParameters.keys():
        quizId = queryStringParameters["quizId"]
        response = table.get_item(
            Key={
                "PK": f"Course#{courseId}",
                "SK": f"Student#{studentId}Quiz#{quizId}"
            })
        items = response["Item"]

    else:
        filter_expression, expression_values = generate_expression_attribute_values(
            token, courseId)
        expression_values[":SK"] = f"Student#{studentId}Quiz#"
        response = table.query(
            KeyConditionExpression="PK= :PK AND begins_with(SK, :SK)",
            FilterExpression=filter_expression,
            ExpressionAttributeValues=expression_values
        )
        items = response["Items"]

    return items


def generate_expression_attribute_values(token, courseId):
    jwt_payload = jwt.decode(
        token, options={"verify_signature": False}, algorithms=["RS256"])
    expression_values = {
        ":PK": f"Course#{courseId}",
        ":SK": f"Quiz#"
    }
    if jwt_payload["custom:role"] == "User":
        filter_expression = 'Visibility = :visibility'
        expression_values[":visibility"] = True
    else:
        filter_expression = 'attribute_exists(Visibility)'
    return filter_expression, expression_values
