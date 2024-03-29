import sys

import boto3
from global_functions.cognito import *
from global_functions.exists_in_db import *
from global_functions.responses import *

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("LMS")

def lambda_handler(event, context):

    try:

        courseId = event['queryStringParameters']['courseId']



        # VALIDATION
        # check if <courseId> exists in database
        if not id_exists("Course", "Course", courseId):
            return response_404("courseId does not exist in database")

        ##################################
        ### READING USERS FROM COGNITO ###
        ##################################

        students = get_users('Users')
        students_to_remove = []

        for student in students:

            studentId = student['studentId']

            if not combination_id_exists("Student", studentId, "Course", courseId):
                students_to_remove.append(student)

            #######################
            ### GET QUIZ SCORES ###
            #######################

            quiz_response = table.query(
                KeyConditionExpression="PK = :PK AND begins_with(SK, :SK)",
                ExpressionAttributeValues={
                    ":PK": f"Course#{courseId}",
                    ":SK": f"Student#{studentId}Quiz",
                })

            quiz_items = quiz_response['Items']
            total_quiz_score = 0
            for quiz in quiz_items:
                quiz_score = float(quiz['QuizScore'])*100 #get back before percentage score (i.e., 0.33 become 33, 0.5 become 50)
                total_quiz_score += quiz_score

            student['TotalQuizScore'] = total_quiz_score

            ###########################
            ### GET HOMEWORK SCORES ###
            ###########################

            homework_response = table.query(
                KeyConditionExpression="PK = :PK AND begins_with(SK, :SK)",
                ExpressionAttributeValues={
                    ":PK": f"Course#{courseId}",
                    ":SK": f"Student#{studentId}Homework"
                })

            homework_items = homework_response['Items']
            total_homework_score = 0
            for homework in homework_items:
                if "HomeworkScore" in homework:
                    homework_score = float(homework['HomeworkScore'])*10 # homework score naturally lower cos only multiply by 10. usually hw is 1-5 score range so max is also 50 (hence, quiz weightage is higher)
                    total_homework_score += homework_score

                student['TotalHomeworkScore'] = total_homework_score

            ######################################
            ### CALCULATE PARTICIPATION POINTS ###
            ######################################

            participation_points = total_quiz_score + total_homework_score
            student['ParticipationPoints'] = int(participation_points)
            ###########################
            ### GET PROGRESS REPORT ###
            ###########################

        for i in students_to_remove:
            students.remove(i)

        return response_200_items(students)


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