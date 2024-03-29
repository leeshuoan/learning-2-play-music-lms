const DynamoDB = require("aws-sdk/clients/dynamodb");
const { response_200, response_400, response_500 } = require("./responses");

const dynamodb = new DynamoDB.DocumentClient();

async function lambda_handler(event, context) {
  try {
    const requestBody = JSON.parse(event.body);

    const courseId = requestBody.courseId;
    const studentId = requestBody.studentId;
    const quizId = requestBody.quizId;
    const submissions = requestBody.submissions;
    let quizScore = 0;

    const getAttemptsParams = {
      TableName: "LMS",
      Key: {
        PK: `Course#${courseId}`,
        SK: `Student#${studentId}Quiz#${quizId}`,
      },
      AttributesToGet: ["QuizAttempt", "QuizMaxAttempts"],
    };

    const attemptsResponse = await dynamodb.get(getAttemptsParams).promise();
    const attempts = attemptsResponse.Item;
    // if (!attempts || !attempts.QuizAttempt || !attempts.QuizMaxAttempts) {
    //   throw new Error("Invalid response from DynamoDB" + attempts);
    // }

    if (attempts.QuizAttempt >= attempts.QuizMaxAttempts) {
      throw new Error("Already attempted max number of times: " + attempts.QuizAttempt);
    }

    const getQuestionParam = {
      TableName: "LMS",
      KeyConditionExpression: "PK = :pk and begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `Course#${courseId}`,
        ":sk": `Quiz#${quizId}Question#`,
      },
    };
    const questionsQuery = await dynamodb.query(getQuestionParam).promise();
    const questions = questionsQuery.Items;
    const numQuestions = questions.length;

    for (const question of questions) {
      const SK = question.SK;
      const questionId = SK.split("Question#")[1];
      const submissionKey = "Question#" + questionId;
      let correct = 0;
      if (question.Answer == submissions[submissionKey]) {
        correct = 1;
        quizScore += 1;
      }
      const updateQuestionParams = {
        TableName: "LMS",
        Key: {
          PK: `Course#${courseId}`,
          SK: `Quiz#${quizId}Question#${questionId}`,
        },
        UpdateExpression: `set Attempts = Attempts + :incr, Correct = Correct + :val, #selection = #selection + :incr`,
        ExpressionAttributeNames: {
          "#selection": submissions[submissionKey],
        },
        ExpressionAttributeValues: {
          ":val": correct,
          ":incr": 1,
        },
      };
      await dynamodb.update(updateQuestionParams).promise();
    }

    const quizScorePercentage = numQuestions > 0 ? Math.round((quizScore / numQuestions) * 10000) / 10000 : 0;

    const updateStudentQuizParams = {
      TableName: "LMS",
      Key: {
        PK: `Course#${courseId}`,
        SK: `Student#${studentId}Quiz#${quizId}`,
      },
      UpdateExpression: "set QuizScore = :newQuizScore, QuizAttempt = QuizAttempt + :val",
      ExpressionAttributeValues: {
        ":newQuizScore": quizScorePercentage,
        ":val": 1,
      },
    };
    await dynamodb.update(updateStudentQuizParams).promise();

    const updateQuizParams = {
      TableName: "LMS",
      Key: {
        PK: `Course#${courseId}`,
        SK: `Quiz#${quizId}`,
      },
      UpdateExpression: "set NumberOfAttempts = NumberOfAttempts + :val, TotalScore = TotalScore + :quizscore",
      ExpressionAttributeValues: {
        ":quizscore": quizScore,
        ":val": 1,
      },
    }

    await dynamodb.update(updateQuizParams).promise();

    return response_200(`Quiz ${quizId} successfully submitted`, {
      score: quizScore,
    });
  } catch (e) {
    return response_400(e.message);
  }
}

module.exports = { lambda_handler };
