import boto3

from aws_cdk import (
    aws_lambda as _lambda,
    aws_apigateway as apigw,
    aws_s3 as s3,
    aws_iam,
    Stack,
    CfnOutput
)

from constructs import Construct


class CourseStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # The code that defines your stack goes here

        # Define Constants Here
        FUNCTIONS_FOLDER = "./lambda_functions/"
        COURSE_FUNCTIONS_FOLDER = "course"
        COURSE_MATERIAL_FUNCTIONS_FOLDER = "course_material"
        COURSE_HOMEWORK_FUNCTIONS_FOLDER = "course_homework"
        COURSE_QUIZ_FUNCTIONS_FOLDER = "course_quiz"
        COURSE_ANNOUNCEMENT_FUNCTIONS_FOLDER = "course_announcement"

        
        # Create S3 bucket with read/write allowed
        L2PMA_question_image_bucket = s3.Bucket(self, "L2PMAQuestionImageBucket")
        policy_statement = aws_iam.PolicyStatement(
            effect=aws_iam.Effect.ALLOW,
            actions=["s3:GetObject", "s3:PutObject", ],
            resources=[L2PMA_question_image_bucket.arn_for_objects("*")],
            principals=[aws_iam.ServicePrincipal('lambda.amazonaws.com')]
        )
        L2PMA_question_image_bucket.add_to_resource_policy(policy_statement)

        # Get existing iam role (lambda-general-role)
        iam = boto3.client("iam")
        general_role = iam.get_role(RoleName="lambda-general-role")
        general_role_arn = general_role["Role"]["Arn"]
        LAMBDA_ROLE = aws_iam.Role.from_role_arn(
            self, "lambda-general-role", general_role_arn)
        s3_dynamodb_role = aws_iam.Role(self, 'S3DynamodbRole',assumed_by=aws_iam.ServicePrincipal('lambda.amazonaws.com'))
        
        # IAM policies for dynamodb readwrite + s3 readwrite
        dynamodb_policy = aws_iam.PolicyStatement(effect = aws_iam.Effect.ALLOW,
          resources = ['arn:aws:dynamodb:*:*:table/*'],
          actions = ['dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:Query']
        )
        s3_dynamodb_role.add_to_policy(dynamodb_policy)

        s3_policy = aws_iam.PolicyStatement(effect = aws_iam.Effect.ALLOW,
          resources = [f'{L2PMA_question_image_bucket.bucket_arn}/*'],
          actions = ['s3:GetObject', 's3:PutObject'])
        s3_dynamodb_role.add_to_policy(s3_policy)


        # Create getCourseHomework AWS Lambda function
        get_course_homework = _lambda.Function(self, "getCourseHomework", runtime=_lambda.Runtime.PYTHON_3_9,
                                               handler=f"{COURSE_HOMEWORK_FUNCTIONS_FOLDER}.get_course_homework.lambda_handler", code=_lambda.Code.from_asset(FUNCTIONS_FOLDER), role=LAMBDA_ROLE)

        # /course/announcement Functions
        get_course_announcement = _lambda.Function(self, "getCourseAnnouncement",  runtime=_lambda.Runtime.PYTHON_3_9, handler=f"{COURSE_ANNOUNCEMENT_FUNCTIONS_FOLDER}.get_course_announcement.lambda_handler", code=_lambda.Code.from_asset(FUNCTIONS_FOLDER), role=LAMBDA_ROLE)
        post_course_announcement = _lambda.Function(self, "postCourseAnnouncement", runtime=_lambda.Runtime.PYTHON_3_9, handler=f"{COURSE_ANNOUNCEMENT_FUNCTIONS_FOLDER}.post_course_announcement.lambda_handler", code=_lambda.Code.from_asset(FUNCTIONS_FOLDER), role=LAMBDA_ROLE)
        delete_course_announcement = _lambda.Function(self, "deleteCourseAnnouncement", runtime=_lambda.Runtime.PYTHON_3_9,handler=f"{COURSE_ANNOUNCEMENT_FUNCTIONS_FOLDER}.delete_course_announcement.lambda_handler", code=_lambda.Code.from_asset(FUNCTIONS_FOLDER), role=LAMBDA_ROLE)

        # /course Functions
        get_course = _lambda.Function(self, "getCourse", runtime=_lambda.Runtime.PYTHON_3_9, handler=f"{COURSE_FUNCTIONS_FOLDER}.get_course.lambda_handler", code=_lambda.Code.from_asset(FUNCTIONS_FOLDER), role=LAMBDA_ROLE)
        post_course = _lambda.Function(self, "postCourse", runtime=_lambda.Runtime.PYTHON_3_9, handler=f"{COURSE_FUNCTIONS_FOLDER}.post_course.lambda_handler", code=_lambda.Code.from_asset(FUNCTIONS_FOLDER), role=LAMBDA_ROLE)
        delete_course = _lambda.Function(self, "deleteCourse", runtime=_lambda.Runtime.PYTHON_3_9, handler=f"{COURSE_FUNCTIONS_FOLDER}.delete_course.lambda_handler", code=_lambda.Code.from_asset(FUNCTIONS_FOLDER), role=LAMBDA_ROLE)


        # # /course/material Functions
        get_course_material = _lambda.Function(self, "get_course_material", runtime=_lambda.Runtime.PYTHON_3_9, handler=f"{COURSE_MATERIAL_FUNCTIONS_FOLDER}.get_course_material.lambda_handler", code=_lambda.Code.from_asset(FUNCTIONS_FOLDER), role=LAMBDA_ROLE)
        post_course_material = _lambda.Function(self, "post_course_material", runtime=_lambda.Runtime.PYTHON_3_9, handler=f"{COURSE_MATERIAL_FUNCTIONS_FOLDER}.post_course_material.lambda_handler", code=_lambda.Code.from_asset(FUNCTIONS_FOLDER), role=LAMBDA_ROLE)
        delete_course_material = _lambda.Function(self, "delete_course_material", runtime=_lambda.Runtime.PYTHON_3_9, handler=f"{COURSE_MATERIAL_FUNCTIONS_FOLDER}.delete_course_material.lambda_handler", code=_lambda.Code.from_asset(FUNCTIONS_FOLDER), role=LAMBDA_ROLE)

        # /course/quiz/
        get_course_quiz = _lambda.Function(self, "getCourseQuiz", runtime=_lambda.Runtime.PYTHON_3_9,
                                              handler=f"{COURSE_QUIZ_FUNCTIONS_FOLDER}.get_course_quiz.lambda_handler", code=_lambda.Code.from_asset(FUNCTIONS_FOLDER), role=LAMBDA_ROLE)

        # /course/quiz/question Functions
        get_course_quiz_question = _lambda.Function(self, "getCourseQuizQuestion", runtime=_lambda.Runtime.PYTHON_3_9,
                                                     handler=f"{COURSE_QUIZ_FUNCTIONS_FOLDER}.get_course_quiz_question.lambda_handler", code=_lambda.Code.from_asset(FUNCTIONS_FOLDER), role=s3_dynamodb_role,
                                                     environment={
                                                        "QUESTION_IMAGE_BUCKET_NAME": L2PMA_question_image_bucket.bucket_name
                                                    })
        post_course_quiz_question = _lambda.Function(self, "postCourseQuizQuestion", runtime=_lambda.Runtime.NODEJS_16_X,
                                                     handler=f"post_course_quiz_question.lambda_handler", code=_lambda.Code.from_asset(f"{FUNCTIONS_FOLDER}/{COURSE_QUIZ_FUNCTIONS_FOLDER}"), role=s3_dynamodb_role,
                                                     environment={
                                                        "QUESTION_IMAGE_BUCKET_NAME": L2PMA_question_image_bucket.bucket_name
                                                    })
        delete_course_quiz_question = _lambda.Function(self, "deleteCourseQuizQuestion", runtime=_lambda.Runtime.NODEJS_16_X,
                                                       handler=f"delete_course_quiz_question.lambda_handler", code=_lambda.Code.from_asset(f"{FUNCTIONS_FOLDER}/{COURSE_QUIZ_FUNCTIONS_FOLDER}"), role=s3_dynamodb_role)
        # Create Amazon API Gateway REST API
        main_api = apigw.RestApi(self, "main", description="All LMS APIs")

        # Create resources for the API
        course_resource = main_api.root.add_resource("course")

        # Create sub-resources under the parent resource
        course_quiz_resource = course_resource.add_resource("quiz")
        course_homework_resource = course_resource.add_resource("homework")
        course_announcement_resource = course_resource.add_resource(
            "announcement")
        course_material_resource = course_resource.add_resource("material")

        # Create sub-sub-resources under the parent resource
        course_quiz_question_resource = course_quiz_resource.add_resource(
            "question")

        # Create methods in the required resources

        # /course
        # Define a JSON Schema to accept Request Body in JSON format for POST Method
        post_course_model = main_api.add_model(
            # this is the response model ID, please give it a unique name and not ResponseModel
            "ResponseModel",
            content_type="application/json",
            model_name="PostCourseModel",
            schema=apigw.JsonSchema(
                title="PostCourseModel",
                schema=apigw.JsonSchemaVersion.DRAFT4,
                type=apigw.JsonSchemaType.OBJECT,
                properties={
                    "courseName": apigw.JsonSchema(type=apigw.JsonSchemaType.STRING),
                    "courseSlot": apigw.JsonSchema(type=apigw.JsonSchemaType.STRING)
                },
                required=[ "courseName", "courseSlot"]))

        course_resource.add_method("GET", apigw.LambdaIntegration(get_course), request_parameters={
            'method.request.querystring.courseId': False})
        course_resource.add_method("DELETE", apigw.LambdaIntegration(delete_course), request_parameters={
            'method.request.querystring.courseId': True})
        course_resource.add_method("POST", apigw.LambdaIntegration(post_course), request_models={
            "application/json": post_course_model})

        # /course/material
        # Define a JSON Schema to accept Request Body in JSON format for POST Method
        post_course_material_model = main_api.add_model(
            "PostCourseMaterialModel",
            content_type="application/json",
            model_name="PostCourseMaterialModel",
            schema=apigw.JsonSchema(
                title="PostCourseMaterialModel",
                schema=apigw.JsonSchemaVersion.DRAFT4,
                type=apigw.JsonSchemaType.OBJECT,
                properties={
                    "courseId": apigw.JsonSchema(type=apigw.JsonSchemaType.STRING),
                    "materialTitle": apigw.JsonSchema(type=apigw.JsonSchemaType.STRING),
                    "materialType": apigw.JsonSchema(type=apigw.JsonSchemaType.STRING),
                    "materialLessonDate": apigw.JsonSchema(type=apigw.JsonSchemaType.STRING),
                    "materialLink": apigw.JsonSchema(type=apigw.JsonSchemaType.STRING),
                    "materialS3Link": apigw.JsonSchema(type=apigw.JsonSchemaType.STRING)
                },
                required=["courseId", "materialTitle", "materialType", "materialLessonDate"]))

        course_material_resource.add_method("GET", apigw.LambdaIntegration(get_course_material), request_parameters={
            'method.request.querystring.courseId': True,
            'method.request.querystring.materialId': False})
        course_material_resource.add_method("DELETE", apigw.LambdaIntegration(delete_course_material), request_parameters={
            'method.request.querystring.courseId': True,
            'method.request.querystring.materialId': True})
        course_material_resource.add_method("POST", apigw.LambdaIntegration(post_course_material), request_models={
            "application/json": post_course_material_model})

        # /course/quiz
        course_quiz_resource.add_method("GET", apigw.LambdaIntegration(get_course_quiz), request_parameters={
          'method.request.querystring.courseId': True,
          'method.request.querystring.studentId': True,
          'method.request.querystring.quizId': False,
        })

        # /course/quiz/question
        post_course_quiz_question_model = main_api.add_model(
            "PostCourseQuizQuestionModel",
            content_type="application/json",
            model_name="PostCourseQuizQuestionModel",
            schema=apigw.JsonSchema(
                title="PostCourseQuizQuestionModel",
                schema=apigw.JsonSchemaVersion.DRAFT4,
                type=apigw.JsonSchemaType.OBJECT,
                properties={
                    "courseId": apigw.JsonSchema(type=apigw.JsonSchemaType.STRING),
                    "quizId": apigw.JsonSchema(type=apigw.JsonSchemaType.STRING),
                    "questionOptionType": apigw.JsonSchema(type=apigw.JsonSchemaType.STRING),
                    "question": apigw.JsonSchema(type=apigw.JsonSchemaType.STRING),
                    "options": apigw.JsonSchema(type=apigw.JsonSchemaType.ARRAY),
                    "answer": apigw.JsonSchema(type=apigw.JsonSchemaType.STRING),
                },
                required=["courseId", "quizId", "materialType", "question", "options","answer"]))

        delete_course_quiz_question_model = main_api.add_model(
            "DeleteCourseQuizQuestionModel",
            content_type="application/json",
            model_name="DeleteCourseQuizQuestionModel",
            schema=apigw.JsonSchema(
                title="DeleteCourseQuizQuestionModel",
                schema=apigw.JsonSchemaVersion.DRAFT4,
                type=apigw.JsonSchemaType.OBJECT,
                properties={
                    "courseId": apigw.JsonSchema(type=apigw.JsonSchemaType.STRING),
                    "quizId": apigw.JsonSchema(type=apigw.JsonSchemaType.STRING),
                    "questionId": apigw.JsonSchema(type=apigw.JsonSchemaType.STRING)
                },
                required=["courseId", "quizId", "questionId"]))

        course_quiz_question_resource.add_method("GET", apigw.LambdaIntegration(get_course_quiz_question), request_parameters={
          'method.request.querystring.courseId': True,
          'method.request.querystring.quizId': True,
          'method.request.querystring.questionId': False,
        })
        course_quiz_question_resource.add_method("DELETE", apigw.LambdaIntegration(delete_course_quiz_question), request_models={
          "application/json": delete_course_quiz_question_model
        })
        course_quiz_question_resource.add_method("POST", apigw.LambdaIntegration(post_course_quiz_question), request_models={
          "application/json": post_course_quiz_question_model
        })

        # /course/homework
        course_homework_resource.add_method("GET", apigw.LambdaIntegration(get_course_homework), request_parameters={
          'method.request.querystring.courseId': True,
          'method.request.querystring.studentId': True,
          'method.request.querystring.homeworkId': False
        })

        # /course/announcement
        # Define a JSON Schema to accept Request Body in JSON format for POST Method
        post_course_announcement_model = main_api.add_model(
            "PostCourseAnnouncementModel",
            content_type="application/json",
            model_name="PostCourseAnnouncementModel",
            schema=apigw.JsonSchema(
                title="PostCourseAnnouncementModel",
                schema=apigw.JsonSchemaVersion.DRAFT4,
                type=apigw.JsonSchemaType.OBJECT,
                properties={
                    "courseId": apigw.JsonSchema(type=apigw.JsonSchemaType.STRING),
                    "content": apigw.JsonSchema(type=apigw.JsonSchemaType.STRING)
                },
                required=["content"]))

        course_announcement_resource.add_method("GET", apigw.LambdaIntegration(get_course_announcement), request_parameters={
            'method.request.querystring.courseId': True,
            'method.request.querystring.announcementId': False})
        course_announcement_resource.add_method("DELETE", apigw.LambdaIntegration(delete_course_announcement), request_parameters={
            'method.request.querystring.courseId': True,
            'method.request.querystring.announcementId': True})
        course_announcement_resource.add_method("POST", apigw.LambdaIntegration(post_course_announcement), request_models={
            'application/json': post_course_announcement_model})

        # Enable CORS for each resource/sub-resource etc.
        course_resource.add_cors_preflight(
            allow_origins=["*"], allow_methods=["GET", "POST", "DELETE"], status_code=200)
        course_quiz_resource.add_cors_preflight(
            allow_origins=["*"], allow_methods=["GET", "POST", "DELETE"], status_code=200)
        course_homework_resource.add_cors_preflight(
            allow_origins=["*"], allow_methods=["GET", "POST", "DELETE"], status_code=200)
        course_quiz_question_resource.add_cors_preflight(
            allow_origins=["*"], allow_methods=["GET", "POST", "DELETE"], status_code=200)
        course_material_resource.add_cors_preflight(
            allow_origins=["*"], allow_methods=["GET", "POST", "DELETE"], status_code=200)
        course_announcement_resource.add_cors_preflight(
            allow_origins=["*"], allow_methods=["GET", "POST", "DELETE"], status_code=200)

        # Export API gateway to use in other Stacks
        CfnOutput(
            self, 'MyApiIdOutput',
            value=main_api.rest_api_id,
            export_name='mainApiId',
        )
        CfnOutput(
            self, 'MyApiRootResourceIdOutput',
            value=main_api.root.resource_id,
            export_name='mainApiRootResourceIdOutput',
        )