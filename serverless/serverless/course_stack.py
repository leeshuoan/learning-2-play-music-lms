import boto3

from aws_cdk import (
    aws_lambda as _lambda,
    aws_apigateway as apigw,
    aws_iam,
    Stack
)

from constructs import Construct


class CourseStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # The code that defines your stack goes here

        # Define Constants Here
        FUNCTIONS_FOLDER = "./lambda_functions/"

        # Get existing iam role (lambda-general-role)
        iam = boto3.client("iam")
        role = iam.get_role(RoleName="lambda-general-role")
        role_arn = role["Role"]["Arn"]
        LAMBDA_ROLE = aws_iam.Role.from_role_arn(
            self, "lambda-general-role", role_arn)

        # Create getCourseQuizzes AWS Lambda function
        get_course_quizzes = _lambda.Function(
            self,
            "getCourseQuizzes",  # name of your lambda function
            runtime=_lambda.Runtime.PYTHON_3_9,
            # change based on your python file name
            handler="get_course_quizzes.lambda_handler",
            code=_lambda.Code.from_asset(FUNCTIONS_FOLDER),
            role=LAMBDA_ROLE
        )

        # Create getCourseQuizQuestions AWS Lambda function
        get_course_quiz_questions = _lambda.Function(
            self,
            "getCourseQuizQuestions",  # name of your lambda function
            runtime=_lambda.Runtime.PYTHON_3_9,
            # change based on your python file name
            handler="get_course_quiz_questions.lambda_handler",
            code=_lambda.Code.from_asset(FUNCTIONS_FOLDER),
            role=LAMBDA_ROLE
        )

        # Create getCourseHomework AWS Lambda function
        get_course_homework = _lambda.Function(
            self,
            "getCourseHomework",  # name of your lambda function
            runtime=_lambda.Runtime.PYTHON_3_9,
            # change based on your python file name
            handler="get_course_homework.lambda_handler",
            code=_lambda.Code.from_asset(FUNCTIONS_FOLDER),
            role=LAMBDA_ROLE
        )

        # Create a new Amazon API Gateway REST API
        course2_api = apigw.RestApi(self, "course2",
                                    description="Course CRUD API from CDK")

        # Create resources for the API
        course_resource = course2_api.root.add_resource("course")

        # Create sub-resources under the parent resource
        course_quizzes_resource = course_resource.add_resource("quizzes")
        course_homework_resource = course_resource.add_resource("homework")

        # Create sub-sub-resources under the parent resource
        course_quiz_questions_resource = course_quizzes_resource.add_resource(
            "questions")

        # Create methods in the required resources
        course_quizzes_resource.add_method(
            "GET", apigw.LambdaIntegration(get_course_quizzes))

        course_quiz_questions_resource.add_method(
            "GET", apigw.LambdaIntegration(get_course_quiz_questions))

        course_homework_resource.add_method(
            "GET", apigw.LambdaIntegration(get_course_homework))