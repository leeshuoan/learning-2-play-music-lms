import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import { Accordion, AccordionDetails, AccordionSummary, Box, Breadcrumbs, Button, Card, Container, Grid, Link, MenuItem, Typography } from "@mui/material";
import MaterialReactTable from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../utils/Loader";

const UserCourse = ({ userInfo }) => {
  const [open, setOpen] = useState(true);
  const [course, setCourse] = useState({});
  const [courseHomework, setCourseHomework] = useState([]);
  const [courseMaterial, setCourseMaterial] = useState([]);
  const [courseQuiz, setCourseQuiz] = useState([]);
  const [participationPoints, setParticipationPoints] = useState(0);
  const [courseAnnouncement, setCourseAnnouncement] = useState([]);
  const [courseProgressReport, setCourseProgressReport] = useState([]);

  const navigate = useNavigate();
  const { category } = useParams();
  const { courseid } = useParams();
  const menuOptions = ["Announcements", "Class Materials", "Quizzes", "Homework", "My Progress Report"];
  const routeMenuMapping = {
    announcement: "Announcements",
    material: "Class Materials",
    quiz: "Quizzes",
    homework: "Homework",
    report: "My Progress Report",
  };

  async function request(endpoint) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    });
    return response.json();
  }

  const getCourseAPI = request(`/course?courseId=${courseid}`);
  const getCourseAnnouncementsAPI = request(`/course/announcement?courseId=${courseid}`);
  const getHomeworkAPI = request(`/course/homework?courseId=${courseid}&studentId=${userInfo.id}`);
  const getMaterialAPI = request(`/course/material?courseId=${courseid}`);
  const getQuizAPI = request(`/course/quiz?courseId=${courseid}&studentId=${userInfo.id}`);
  const getProgressReportAPI = request(`/course/report?courseId=${courseid}&studentId=${userInfo.id}`);
  const getClassListAPI = request(`/course/classlist?courseId=${courseid}`);

  const columns = useMemo(
    () => [
      {
        accessorKey: "MaterialTitle",
        id: "title",
        header: "Title",
        Cell: ({ cell, row }) => <Link onClick={() => navigate(`/home/course/${courseid}/material/${row.original.id}`)}>{row.original.MaterialTitle}</Link>,
      },
      {
        accessorKey: "MaterialType",
        id: "type",
        header: "Type",
      },
      {
        accessorKey: "MaterialLessonDate",
        id: "lessonDate",
        header: "Lesson Date",
      },
    ],
    []
  );

  useEffect(() => {
    async function fetchData() {
      const [data1, data2, data3, data4, data5, data6, data7] = await Promise.all([getCourseAPI, getHomeworkAPI, getMaterialAPI, getQuizAPI, getCourseAnnouncementsAPI, getProgressReportAPI, getClassListAPI]);

      const courseData = {
        id: data1[0].SK.split("#")[1],
        name: data1[0].CourseName,
        timeslot: data1[0].CourseSlot,
        teacher: data1[0].TeacherName,
      };
      setCourse(courseData);

      async function fetchHomeworkData() {
        try {
          const homeworkData = await Promise.all(
            data2.map(async (homework) => {
              const id = homework.SK.split("Homework#")[1];
              const date = new Date(homework.HomeworkDueDate);
              const formattedDate = `${date.toLocaleDateString()} `;
              // const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
              const homeworkFeedback = await fetchHomeworkFeedback(id);
              const assignedDate = new Date(homework.HomeworkAssignedDate);
              const formattedAssignedDate = `${assignedDate.toLocaleDateString()} `;
              return {
                ...homework,
                id,
                HomeworkDueDate: formattedDate,
                HomeworkAssignedDate: formattedAssignedDate,
                Marked: homeworkFeedback.Marked,
                NumAttempts: homeworkFeedback.NumAttempts,
                assignedDate: assignedDate,
              };
            })
          );
          homeworkData.sort((a, b) => a.assignedDate - b.assignedDate);
          return homeworkData;
        } catch (error) {
        }
      }

      async function fetchHomeworkFeedback(id) {
        const data = await request(`/course/homework/feedback?courseId=${courseid}&homeworkId=${id}&studentId=${userInfo.id}`);
        const homeworkFeedback = {
          Marked: data.Marked,
          NumAttempts: data.NumAttempts != 0 ? data.NumAttempts : "",
        };
        return homeworkFeedback;
      }
      fetchHomeworkData().then((data) => {
        setCourseHomework(data);
      });

      const materialData = data3.map((material) => {
        const id = material.SK.split("Material#")[1];
        const date = new Date(material.MaterialLessonDate);
        const formattedDate = `${date.toLocaleDateString()}`;
        return { ...material, id, MaterialLessonDate: formattedDate };
      });
      setCourseMaterial(materialData);

      const quizData = data4.map((quiz) => {
        const id = quiz.SK.split("Quiz#")[1];
        const date = new Date(quiz.QuizDueDate);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        return { ...quiz, id, QuizDueDate: formattedDate };
      });
      setCourseQuiz(quizData);

      const announcementsData = data5.map((announcement) => {
        const id = announcement.SK.split("Announcement#")[1];
        const date = new Date(announcement.Date);
        const formattedDate = date.toLocaleDateString();
        return { ...announcement, id, Date: formattedDate, sortDate: date };
      });
      announcementsData.sort((a, b) => b.sortDate - a.sortDate);
      setCourseAnnouncement(announcementsData);

      const progressReportData = data6.map((report) => {
        const id = report.SK.split("Report#")[1];
        const date = new Date(report["AvailableDate"]);
        const nowDate = new Date();
        if (nowDate > date) {
          report["Available"] = true;
        } else {
          report["Available"] = false;
        }
        const formattedDate = date.toLocaleDateString();
        return { ...report, id, availableDate: formattedDate, sortDate: date };
      });
      progressReportData.sort((a, b) => b.sortDate - a.sortDate);
      setCourseProgressReport(progressReportData);

      data7.forEach((student) => {
        if (student.studentId == userInfo.id) {
          setParticipationPoints(student.ParticipationPoints);
        }
      });
    }

    fetchData().then(() => {
      setOpen(false);
    });
  }, []);

  const menuNavigate = (option) => {
    if (option == "Announcements") navigate(`/home/course/${course.id}/announcement`);
    if (option == "Class Materials") navigate(`/home/course/${course.id}/material`);
    if (option == "Quizzes") navigate(`/home/course/${course.id}/quiz`);
    if (option == "Homework") navigate(`/home/course/${course.id}/homework`);
    if (option == "My Progress Report") navigate(`/home/course/${course.id}/report`);
  };

  return (
    <Container maxWidth="xl" sx={{ width: { xs: 1, sm: 0.9 } }}>
      <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" />} sx={{ mt: 3 }}>
        <Link
          underline="hover"
          color="inherit"
          sx={{ display: "flex", alignItems: "center" }}
          onClick={() => {
            navigate("/home");
          }}>
          <HomeIcon sx={{ mr: 0.5 }} />
          Home
        </Link>
        <Typography color="text.primary">{course.name}</Typography>
      </Breadcrumbs>

      <Card sx={{ py: 1.5, px: 3, mt: 2, display: { xs: "flex", sm: "flex" } }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box>
            <Typography variant="h5" sx={{ color: "primary.main" }}>
              {course.name}
            </Typography>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Date: {course.timeslot}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
              {course.teacher}
            </Typography>
            <Typography variant="body2" sx={{ textAlign: "right" }}>
              Teacher
            </Typography>
          </Box>
        </Box>
      </Card>

      <Grid container spacing={2} sx={{ pt: 2 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ py: 2, px: 3, mt: 2, display: { xs: "none", sm: "block" } }}>
            {menuOptions.map((option, key) => (
              <MenuItem key={key} sx={{ mb: 1, color: routeMenuMapping[category] == option ? "primary.main" : category === undefined && option == "Announcements" ? "primary.main" : "", "&:hover": { color: "primary.main" } }} onClick={() => menuNavigate(option)}>
                <Typography variant="subtitle1">{option}</Typography>
              </MenuItem>
            ))}
          </Card>

          <Card sx={{ py: { sm: 1 }, px: 1, display: { xs: "block", sm: "none" } }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Typography variant="h5" sx={{ color: "primary.main" }}>
                    {category === undefined ? "Announcements" : routeMenuMapping[category]}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {menuOptions.map((option, key) => (
                  <MenuItem key={key} sx={{ mb: 0.5, color: routeMenuMapping[category] == option ? "primary.main" : category === undefined && option == "Announcements" ? "primary.main" : "", "&:hover": { color: "primary.main" } }} onClick={() => menuNavigate(option)}>
                    <Typography variant="subtitle1">{option}</Typography>
                  </MenuItem>
                ))}
              </AccordionDetails>
            </Accordion>
          </Card>
        </Grid>

        <Grid item xs={12} md={9}>
          <Box>
            <Card sx={{ py: 3, px: 5, mt: 2, display: category == "announcement" ? "block" : category === undefined ? "block" : "none" }}>
              <Typography variant="h5">Class Announcements</Typography>
              {courseAnnouncement.map((announcement, key) => (
                <Card key={key} variant="outlined" sx={{ boxShadow: "none", mt: 2, p: 2 }}>
                  <Typography variant="subtitle1" sx={{}}>
                    {announcement.Title}
                  </Typography>
                  <Typography variant="subsubtitle" sx={{ mb: 1 }}>
                    Posted {announcement.Date}
                  </Typography>
                  <Typography variant="body2">{announcement.Content}</Typography>
                </Card>
              ))}
              {courseAnnouncement.length == 0 && (
                <Typography variant="h6" sx={{ textAlign: "center", mt: 6 }}>
                  No course announcements available yet!
                </Typography>
              )}
            </Card>

            <Box sx={{ display: category == "material" ? "block" : "none" }}>
              {courseMaterial.length != 0 ? (
                <Box m={2}>
                  <MaterialReactTable
                    columns={columns}
                    enableFullScreenToggle={false}
                    enableDensityToggle={false}
                    data={courseMaterial}
                    initialState={{ density: "compact" }}
                    renderTopToolbarCustomActions={({ table }) => {
                      return (
                        <Typography m={1} variant="h6">
                          Class Materials
                        </Typography>
                      );
                    }}></MaterialReactTable>
                </Box>
              ) : (
                <Typography variant="h6" sx={{ textAlign: "center", mt: 6 }}>
                  No course materials available yet!
                </Typography>
              )}
            </Box>

            <Box sx={{ display: category == "quiz" ? "block" : "none" }}>
              {courseQuiz.map((quiz, key) => (
                <Card key={key} sx={{ py: 3, px: 4, mt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {quiz.QuizTitle}
                  </Typography>
                  <Grid container spacing={2} sx={{ alignItems: "center" }}>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="contained"
                        disabled={quiz.QuizAttempt >= quiz.QuizMaxAttempts}
                        onClick={() => {
                          navigate(`${quiz.id}`);
                        }}>
                        <PlayCircleFilledIcon sx={{ mr: 1 }} />
                        Start Quiz
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body1" sx={{ textAlign: "center", display: { xs: "none", sm: "block" }, color: "primary.main" }}>
                        Score
                      </Typography>
                      <Typography variant="body1" sx={{ textAlign: "center", display: { xs: "none", sm: "block" } }}>
                        {quiz.QuizScore == 0 ? "-" : quiz.QuizScore * 100 + "%"}
                      </Typography>
                      <Typography variant="body1" sx={{ display: { xs: "flex", sm: "none" } }}>
                        <span sx={{ color: "primary.main", mr: 0.5 }}>Score:</span>
                        {quiz.QuizScore * 100}%
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body1" sx={{ textAlign: "center", color: "primary.main", display: { xs: "none", sm: "block" } }}>
                        Attempts
                      </Typography>
                      <Typography variant="body1" sx={{ textAlign: "center", color: quiz.attempts == 0 ? "grey" : "", display: { xs: "none", sm: "block" } }}>
                        {quiz.QuizAttempt}/{quiz.QuizMaxAttempts}
                      </Typography>
                      <Typography variant="body1" sx={{ color: quiz.attempts == 0 ? "grey" : "", display: { xs: "flex", sm: "none" } }}>
                        <span sx={{ color: "primary.main", mr: 0.5 }}>Attempts:</span>
                        {quiz.QuizAttempt}/{quiz.QuizMaxAttempts}
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              ))}
              {courseQuiz.length == 0 && (
                <Typography variant="h6" sx={{ textAlign: "center", mt: 6 }}>
                  No quizzes available yet!
                </Typography>
              )}
            </Box>

            <Box sx={{ display: category == "homework" ? "block" : "none" }}>
              <Grid container spacing={2} sx={{ px: 4, mt: 2, display: { xs: "none", sm: "flex" } }}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2">HOMEWORK TITLE</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="subtitle2" align="center">
                    ASSIGNED DATE
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="subtitle2" align="center">
                    DUE DATE
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="subtitle2" align="center">
                    SUBMISSIONS
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="subtitle2" align="center">
                    EVALUATION STATUS
                  </Typography>
                </Grid>
              </Grid>
              {courseHomework.map((homework, key) => (
                <Card key={key} sx={{ py: 3, px: 4, mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body1" sx={{ color: "primary.main" }}>
                        <Link onClick={() => navigate("" + homework.id)}>{homework.HomeworkTitle}</Link>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="body1" sx={{ textAlign: "center", display: { xs: "none", sm: "block" } }}>
                        {homework.HomeworkAssignedDate}
                      </Typography>
                      <Typography variant="body1" sx={{ display: { xs: "block", sm: "none" } }}>
                        Assigned Date: {homework.HomeworkAssignedDate}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="body1" sx={{ textAlign: "center", display: { xs: "none", sm: "block" } }}>
                        {homework.HomeworkDueDate}
                      </Typography>
                      <Typography variant="body1" sx={{ display: { xs: "block", sm: "none" } }}>
                        Due Date: {homework.HomeworkDueDate}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="body1" sx={{ textAlign: "center", display: { xs: "none", sm: "block" }, color: homework.submission == 0 ? "grey" : "" }}>
                        {homework.NumAttempts ? homework.NumAttempts : "-"}
                      </Typography>
                      <Typography variant="body1" sx={{ display: { xs: "block", sm: "none" }, color: homework.submission == 0 ? "grey" : "" }}>
                        Submissions: {homework.NumAttempts}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="body1" sx={{ textAlign: "center", display: { xs: "none", sm: "block" } }}>
                        {homework.Marked ? <Link onClick={() => navigate(homework.id + "/feedback")}>Marked</Link> : "-"}
                      </Typography>
                      <Typography variant="body1" sx={{ display: { xs: "block", sm: "none" } }}>
                        Evaluation Status: {homework.Marked ? <Link onClick={() => navigate(homework.id + "/feedback")}> Marked</Link> : "-"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              ))}
              {courseHomework.length == 0 && (
                <Typography variant="h6" sx={{ textAlign: "center", mt: 6 }}>
                  No homework available yet!
                </Typography>
              )}
            </Box>

            <Box sx={{ display: category == "report" ? "block" : "none" }}>
              <Card sx={{ py: 3, px: 4, mt: 2 }}>
                <Typography variant="subtitle1" sx={{ textAlign: "center" }}>
                  Your Points
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <EmojiEventsIcon fontSize="large" sx={{ color: "#FFB118" }} />
                  <Typography variant="h4">{participationPoints}</Typography>
                </Box>
              </Card>
              <Card sx={{ py: 3, px: 5, mt: 2 }}>
                <Typography variant="h6" sx={{ textAlign: "center" }}>
                  My Progress Report
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle1" sx={{ textAlign: "center", ml: 2 }}>
                    TITLE
                  </Typography>
                  <Typography variant="subtitle1" sx={{ textAlign: "center", mr: 2 }}>
                    DATE AVAILABLE
                  </Typography>
                </Box>
                {courseProgressReport.map((report, key) => (
                  <Card key={key} variant="outlined" sx={{ py: 2, px: 2, mt: 2, boxShadow: "none" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="subtitle1" color="primary.main">
                        <Link onClick={() => navigate("" + report.id)}>{report.Title}</Link>
                      </Typography>
                      <Typography variant="subttile1" color={report.Available ? "black" : "lightgrey"}>
                        {report.availableDate}
                      </Typography>
                    </Box>
                  </Card>
                ))}
                {courseProgressReport.length == 0 && (
                  <Typography variant="h6" sx={{ textAlign: "center", mt: 6 }}>
                    No course reports available yet!
                  </Typography>
                )}
              </Card>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Loader open={open} />
    </Container>
  );
};

export default UserCourse;
