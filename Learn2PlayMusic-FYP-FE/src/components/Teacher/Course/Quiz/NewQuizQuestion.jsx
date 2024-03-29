import ClearIcon from "@mui/icons-material/Clear";
import { Box, Button, Card, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const NewQuizQuestion = ({ qnInfo, handleQuestionChange, questionNumber }) => {
  const [question, setQuestion] = useState("");
  const [file, setFile] = useState(null);
  const [image, setImage] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionType, setQuestionType] = useState("multiple-choice");
  const [options, setOptions] = useState(["", "", "", ""]);

  const fileUploaded = async (e) => {
    setFile(e.target.files[0]);

    if (e.target.files[0]) {
      const reader = new FileReader();
      reader.readAsBinaryString(e.target.files[0]);

      reader.onload = (event) => {
        const uploadedImage = `data:${e.target.files[0].type};base64,${btoa(event.target.result)}`;
        setImage(uploadedImage);
      };
    }
  };

  useEffect(() => {
    const newQnInfo = {
      questionNumber: questionNumber,
      question: question,
      questionOptionType: questionType,
      options: options,
      answer: answer,
      questionImage: image,
    };
    handleQuestionChange(newQnInfo);
  }, [question, questionType, options, answer, image]);

  const handleQnTypeChange = (event) => {
    setOptions(["", "", "", ""]);
    setQuestionType(event.target.value);
  };

  const handleQnChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleOptionChange = (idx, event) => {
    setOptions(
      options.map((option, index) => {
        if (idx === index) {
          return event.target.value;
        } else {
          return option;
        }
      })
    );
  };

  const handleTrueFalseChange = (event) => {
    setOptions(["True", "False"]);
    setAnswer(event.target.value);
  };

  const handleAnswerChange = (event) => {
    setAnswer(options[event.target.value]);
  };

  return (
    <>
      <Card variant="outlined" sx={{ boxShadow: "none", mt: 3, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Question {questionNumber}
        </Typography>
        <Grid container sx={{ mb: 2 }} spacing={2}>
          <Grid item xs={12} md={6}>
            <InputLabel id="question-label">Question *</InputLabel>
            <TextField id="question" value={question} fullWidth onChange={handleQnChange} variant="outlined" required />
          </Grid>
          <Grid item xs={12} md={6}>
            <InputLabel id="question-image-label">Image [Optional]</InputLabel>
            {file == null ? (
              <Button variant="contained" sx={{ backgroundColor: "lightgrey", color: "black", boxShadow: "none", ":hover": { backgroundColor: "hovergrey" } }} component="label">
                ADD A FILE
                <input hidden accept="image/*" multiple type="file" onChange={fileUploaded} />
              </Button>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <IconButton
                  sx={{ pl: 0 }}
                  onClick={() => {
                    setFile(null);
                    setImage("");
                  }}>
                  <ClearIcon />
                </IconButton>
                <Typography>{file.name}</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
        <InputLabel id="question-label">Question Type *</InputLabel>
        <Grid container columnSpacing={2}>
          <Grid item xs={12} md={6}>
            <Select labelId="question-label" id="questionType" fullWidth value={questionType} onChange={handleQnTypeChange}>
              <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
              <MenuItem value="true-false">True or False</MenuItem>
            </Select>
          </Grid>
        </Grid>
        <Box sx={{ display: questionType === "multiple-choice" ? "block" : "none" }}>
          <RadioGroup onChange={(e) => handleAnswerChange(e)}>
            <Grid container columnSpacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <FormControlLabel sx={{ mr: 0 }} value={0} control={<Radio checked={answer == options[0] && answer != ""} size="small" sx={{ ml: 1 }} disabled={options[0] == ""} />} />
                  <InputLabel id="question-label">Option 1 *</InputLabel>
                </Box>
                <TextField id="question" value={options[0]} fullWidth onChange={() => handleOptionChange(0, event)} variant="outlined" required />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <FormControlLabel sx={{ mr: 0 }} value={1} control={<Radio checked={answer == options[1] && answer != ""} size="small" sx={{ ml: 1 }} disabled={options[1] == ""} />} />
                  <InputLabel id="question-label">Option 2 *</InputLabel>
                </Box>
                <TextField id="question" value={options[1]} fullWidth onChange={() => handleOptionChange(1, event)} variant="outlined" required />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <FormControlLabel sx={{ mr: 0 }} value={2} control={<Radio checked={answer == options[2] && answer != ""} size="small" sx={{ ml: 1 }} disabled={options[2] == ""} />} />
                  <InputLabel id="question-label">Option 3 *</InputLabel>
                </Box>
                <TextField id="question" value={options[2]} fullWidth onChange={() => handleOptionChange(2, event)} variant="outlined" required />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <FormControlLabel sx={{ mr: 0 }} value={3} control={<Radio checked={answer == options[3] && answer != ""} size="small" sx={{ ml: 1 }} disabled={options[3] == ""} />} />
                  <InputLabel id="question-label">Option 4 *</InputLabel>
                </Box>
                <TextField id="question" value={options[3]} fullWidth onChange={() => handleOptionChange(3, event)} variant="outlined" required />
              </Grid>
            </Grid>
          </RadioGroup>
          <Typography variant="subsubtitle">Select the correct option using the radio buttons</Typography>
        </Box>
        <Box sx={{ display: questionType === "true-false" ? "block" : "none" }}>
          <InputLabel sx={{ mt: 2 }}>Correct Option</InputLabel>
          <RadioGroup onChange={(e) => handleTrueFalseChange(e)}>
            <FormControlLabel sx={{ mr: 0 }} value="True" control={<Radio size="small" />} label="True" />
            <FormControlLabel sx={{ mr: 0 }} value="False" control={<Radio size="small" />} label="False" />
          </RadioGroup>
        </Box>
      </Card>
    </>
  );
};

export default NewQuizQuestion;
