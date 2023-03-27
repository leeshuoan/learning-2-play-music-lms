import sys
import boto3
import json

from global_functions.responses import *
from global_functions.exists_in_db import *
from global_functions.cognito import *

def lambda_handler(event, context):

    try:
        userId = event['queryStringParameters']['userId']

        if not userId:
            return response_404('userId does not exist in Cognito')

        user = get_user(userId)
        admins = get_users('Admins')
        students = get_users('Users')
        teachers = get_users('Teachers')
        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table("LMS")
        contactlist = []

        if 'studentId' in user:
          for teacher in teachers:
            if has_student_teacher_pairing(user['studentId'], teacher['teacherId'], table) and teacher['teacherId']!=userId:
                contactlist.append(teacher)
          [contactlist.append(admin) for admin in admins]

        elif 'teacherId' in user:
          for student in students:
              if has_student_teacher_pairing(student['studentId'], user['teacherId'], table) and student['studentId']!=userId:
                  contactlist.append(student)
          [contactlist.append(admin) for admin in admins]

        else: # is admin
          [contactlist.append(admin) for admin in admins if admin['adminId']!=userId]
          [contactlist.append(teacher) for teacher in teachers if teacher['teacherId']!=userId]
          [contactlist.append(student) for student in students if student['studentId']!=userId]

        return response_200_items(contactlist)

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