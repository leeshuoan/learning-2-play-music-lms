import { Box, Button, Divider, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../../utils/Loader";

const StudentProgressReport = (report) => {
  const [loading, setLoading] = useState(false);
  const metrics = {
    posture: "Posture",
    rhythm: "Rhythm",
    toneQuality: "Tone Quality",
    dynamicsControl: "Dynamic Control",
    articulation: "Articulation",
    sightReading: "Sight Reading",
    practice: "Reading",
    theory: "Theory",
    scales: "Scales",
    aural: "Aural",
    musicality: "Musicality",
    performing: "Performing",
    enthusiasm: "Enthusiasm",
    punctuality: "Punctuality",
    attendance: "Attendance",
  };
  const performance = ["Poor", "Weak", "Satisfactory", "Good", "Excellent", "N.A."];
  const navigate = useNavigate();
  const [goals, setGoals] = useState(report.report.GoalsForNewTerm);
  const [comments, setComments] = useState(report.report.AdditionalComments);
  const [evaluation, setEvaluation] = useState(report.report.EvaluationList);

  async function request(endpoint) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const handleGoalsChange = (event) => {
    setGoals(event.target.value);
  };

  const handleCommentsChange = (event) => {
    setComments(event.target.value);
  };

  const handleEvaluationChange = (event) => {
    setEvaluation({ ...evaluation, [event.target.name]: event.target.value });
  };

  async function submitReport(e) {
    setLoading(true);
    e.preventDefault();
    for (let key in evaluation) {
      if (evaluation[key] === "") {
        toast.error("Please check all the checkboxes");
        setLoading(false);
        return;
      }
    }
    if (goals === "") {
      toast.error("Please fill in the goals for the new term");
      setLoading(false);
      return;
    }
    const bodyParams = JSON.stringify({
      studentId: report.userId,
      evaluationList: evaluation,
      goalsForNewTerm: goals,
      additionalComments: comments,
      reportId: report.report.ReportId,
      title: report.report.Title,
      availableDate: report.report.AvailableDate,
      updatedDate: report.report.UpdatedDate,
      courseId: report.courseId,
    });

    const response = await fetch(`${import.meta.env.VITE_API_URL}/course/report`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: bodyParams,
    });

    if (response) {
      setLoading(false);
      navigate(`/teacher/course/${report.courseId}/classlist`);
      toast.success("Report updated successfully");
    }
  }

  return (
    <>
      <Box sx={{ display: report.report.Available ? "block" : "none" }}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1">Available on: {report.report.AvailableDate == "" ? "-" : new Date(report.report.AvailableDate).toLocaleDateString() + " " + new Date(report.report.AvailableDate).toLocaleTimeString()}</Typography>
        <Typography variant="subtitle1" sx={{ mt: 1, mb: 2 }}>
          Last updated: {report.report.UpdatedDate == "" ? "-" : new Date(report.report.UpdatedDate).toLocaleDateString() + " " + new Date(report.report.UpdatedDate).toLocaleTimeString()}
        </Typography>
        <form onSubmit={submitReport}>
          {Object.keys(metrics).map((metric, key) => (
            <Box key={key}>
              <FormLabel>{metrics[metric] + "*"}</FormLabel>
              <RadioGroup name={metric} defaultValue={report.report.EvaluationList[metric]} onChange={handleEvaluationChange} sx={{ mb: 1 }} row>
                {performance.map((performance, key) => (
                  <FormControlLabel value={performance} key={key} control={<Radio size="small" />} label={performance} />
                ))}
              </RadioGroup>
            </Box>
          ))}
          <FormLabel id="goals-for-the-new-term" sx={{ mt: 2 }}>
            Goals for the New Term*
          </FormLabel>
          <TextField variant="outlined" rows={7} multiline fullWidth sx={{ mt: 1, mb: 2 }} value={goals} onChange={handleGoalsChange} />
          <FormLabel id="additional-comments">Additional Comments</FormLabel>
          <TextField variant="outlined" rows={7} multiline fullWidth sx={{ mt: 1 }} value={comments} onChange={handleCommentsChange} />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" sx={{ mt: 2 }} type="submit">
              Submit
            </Button>
          </Box>
        </form>
      </Box>

      <Box sx={{ display: report.report.Available ? "none" : "block" }}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 1, color: "grey" }}>
          Not Available Yet
        </Typography>
        <Typography variant="subtitle1">Available on: {report.report.AvailableDate}</Typography>
      </Box>
      <Loader open={loading}></Loader>
    </>
  );
};

export default StudentProgressReport;
