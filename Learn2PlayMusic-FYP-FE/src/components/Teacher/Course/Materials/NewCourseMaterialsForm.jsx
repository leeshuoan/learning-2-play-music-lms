import ClearIcon from "@mui/icons-material/Clear";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import { Box, Button, Card, Container, IconButton, InputAdornment, Link, TextField, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import CustomBreadcrumbs from "../../../utils/CustomBreadcrumbs";
import Loader from "../../../utils/Loader";

const NewCourseMaterialsForm = ({ userInfo }) => {
  dayjs.extend(customParseFormat);
  const navigate = useNavigate();
  const { courseid } = useParams();

  const [open, setOpen] = useState(true);
  const [course, setCourse] = useState({});
  const [date, setDate] = useState(null);
  const [embeddedLink, setEmbeddedLink] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [title, setTitle] = useState("");
  const [base64Attachment, setBase64Attachment] = useState(""); // base 64 file

  // file handling
  const fileToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(null, reader.result);
    reader.onerror = (error) => callback(error, null);
  };
  const fileUploaded = (e) => {
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
    fileToBase64(e.target.files[0], (err, result) => {
      if (result) {
        setBase64Attachment(result);
      }
    });
  };
  const handleRemoveFile = () => {
    setFile(null);
    setFileName(null);
    setBase64Attachment("");
  };
  const downloadUploadedFile = () => {
    const url = URL.createObjectURL(file);
    const linkToDownloadUploadedFile = document.createElement("a");
    linkToDownloadUploadedFile.href = url;
    linkToDownloadUploadedFile.download = fileName;
    document.body.appendChild(linkToDownloadUploadedFile);
    linkToDownloadUploadedFile.click();
    document.body.removeChild(linkToDownloadUploadedFile);
  };
  const cleanMaterialLink = () => {
    let cleanedLink = embeddedLink;
    if (!embeddedLink.startsWith("https://") && !embeddedLink.startsWith("http://")) {
      cleanedLink = "https://" + embeddedLink;
    } else {
      cleanedLink = embeddedLink;
    }
    return cleanedLink;
  };
  // helper functions
  function buildRequestBody(materialTypeStr) {
    var cleanedLink = materialTypeStr == "Link" ? cleanMaterialLink() : "";

    const requestBodyObject = {
      courseId: courseid,
      materialTitle: title,
      materialLessonDate: date.add(1, "day").toISOString(),
      materialLink: cleanedLink,
      materialType: materialTypeStr,
      materialAttachment: base64Attachment,
      materialAttachmentFileName: fileName,
    };
    return JSON.stringify(requestBodyObject);
  }
  function validateInput() {
    if (embeddedLink !== "" && file !== null) {
      return {
        error: true,
        message: "Please only upload one file or link!",
      };
    }
    if (title === "" || (embeddedLink === "" && file === null) || date.$d === "Invalid Date") {
      return {
        error: true,
        message: "Please fill in all the fields!",
      };
    }
    return {
      error: false,
    };
  }
  // submit ==============================================================================================================================================
  async function handleSubmit() {
    setOpen(true);
    const validationResult = validateInput();
    if (validationResult.error) {
      toast.error(validationResult.message);
      setOpen(false);
      return;
    }
    const materialTypeStr = file ? file.type.split("/")[1].toUpperCase() : "Link";
    const requestBody = buildRequestBody(materialTypeStr);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/course/material`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody,
    });

    if (response.status === 200) {
      toast.success("Material added successfully!");
      navigate(`/teacher/course/${courseid}/material`);
    } else {
      toast.error("Failed to add material!");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }
  // ========================================================================================================================
  async function request(endpoint) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json();
  }
  const getCourseAPI = request(`/course?courseId=${courseid}`);

  useEffect(() => {
    //  the page is not rendering properly when the data is fetched in the useEffect, help me fix this

    async function fetchData() {
      const data1 = await getCourseAPI;

      let courseData = {
        id: data1[0].SK.split("#")[1],
        name: data1[0].CourseName,
        timeslot: data1[0].CourseSlot,
        teacher: data1[0].TeacherName,
      };
      setCourse(courseData);
    }
    fetchData().then(() => {
      setOpen(false);
    });
  }, []);

  // ========================================================================================================================
  return (
    <Container maxWidth="xl" sx={{ width: { xs: 1, sm: 0.9 } }}>
      {/* breadcrumbs */}
      <CustomBreadcrumbs root="/teacher" links={[{ name: course.name, path: `/teacher/course/${courseid}/material` }]} breadcrumbEnding="Class Materials" />
      {/* body */}
      <Card sx={{ py: 1.5, px: 3, mt: 2, display: { xs: "flex", sm: "flex" } }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box>
            <Typography variant="h5" sx={{ color: "primary.main" }}>
              {course.name}
            </Typography>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Timeslot: {course.timeslot}
            </Typography>
          </Box>
        </Box>
      </Card>
      <Card sx={{ py: 1.5, px: 3, mt: 2, display: { xs: "flex", sm: "flex" } }}>
        <Box sx={{ display: "flex", width: "100%" }}>
          <Container maxWidth="xl">
            <Typography variant="h5" sx={{ color: "primary", mt: 3 }}>
              New Class Material
            </Typography>
            <TextField
              required
              fullWidth
              label="Title"
              variant="outlined"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
              }}
              sx={{ mt: 3 }}
            />
            <LocalizationProvider required dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Lesson Date*"
                sx={{ mt: 3 }}
                value={date}
                onChange={(newValue) => {
                  setDate(newValue);
                }}
                component={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
            <Typography variant="h6" sx={{ mt: 3 }}>
              Upload File or Embed Link
            </Typography>
            {file == null ? (
              <Button variant="outlined" sx={{ color: "text.primary", mt: 3 }} size="large" startIcon={<FileUploadIcon />} component="label">
                Upload File
                <input hidden accept="application/pdf" multiple type="file" onChange={fileUploaded} />
              </Button>
            ) : (
              <></>
            )}
            {file ? (
              <div>
                <Typography variant="body2" style={{ textDecoration: "underline" }}>
                  <IconButton onClick={handleRemoveFile}>
                    <ClearIcon />
                  </IconButton>
                  <Link _target="blank" onClick={downloadUploadedFile}>
                    {fileName}
                  </Link>
                </Typography>
              </div>
            ) : (
              <Typography variant="body2">No file uploaded yet</Typography>
            )}
            {/* handle link */}
            <TextField
              label="Embedded Link"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <InsertLinkIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        setEmbeddedLink("");
                      }}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              sx={{ mt: 3 }}
              value={embeddedLink}
              onChange={(event) => {
                setEmbeddedLink(event.target.value);
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, mb: 1 }}>
              <Button
                variant="outlined"
                sx={{ color: "primary.main" }}
                onClick={() => {
                  navigate(`/teacher/course/${courseid}/material`);
                }}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSubmit}>
                Post
              </Button>
            </Box>
          </Container>
        </Box>
      </Card>
      <Loader open={open} />
    </Container>
  );
};

export default NewCourseMaterialsForm;
