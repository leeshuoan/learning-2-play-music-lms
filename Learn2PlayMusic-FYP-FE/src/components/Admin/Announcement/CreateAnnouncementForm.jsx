import { Box, Button, Grid, TextField, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import Loader from "../../utils/Loader";

export default function CreateAnnouncementForm({ handleCloseModal, handleCloseModalSuccess }) {
  const theme = useTheme();
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [content, setContent] = useState("");
  const [open, setOpen] = useState(false);

  const handleAnnouncementTitleChange = (event) => {
    setAnnouncementTitle(event.target.value);
  };
  const handleContentChange = (event) => {
    setContent(event.target.value);
  };
  const GAendpoint = `${import.meta.env.VITE_API_URL}/generalannouncement`;
  const submitForm = async (event) => {
    setOpen(true);
    event.preventDefault();

    if (announcementTitle === "" || content === "") {
      setOpen(false);
      toast.error("Please fill in all fields!");
      return;
    }
    let response;
    try {
      response = await fetch(GAendpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          announcementTitle: announcementTitle,
          content: content,
        }),
      });
    } catch (error) {
      toast.error("An unexpected error occurred!");
      setOpen(false);
      return;
    }
    setOpen(false);
    if (response.status == 200) {
      const data = await response.json();
      toast.success(`Announcement ${announcementTitle} added!`);
      handleCloseModalSuccess();
    } else {
      toast.error(`Announcement ${announcementTitle} failed to add!`);
      handleCloseModal();
    }
  };

  return (
    <form noValidate onSubmit={submitForm}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5">Create new general announcement</Typography>
        </Grid>
        <Grid item xs={12} sm={12} sx={{ mt: 2 }}>
          <TextField variant="outlined" required fullWidth label="Title" value={announcementTitle} onChange={handleAnnouncementTitleChange} autoFocus />
        </Grid>

        <Grid item xs={12} sx={{ mt: 2 }}>
          <TextField variant="outlined" required fullWidth label="Content" autoComplete="email" value={content} onChange={handleContentChange} multiline />
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "flex",

          justifyContent: "space-between",
          marginTop: 3,
        }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "lightgrey",
            color: "black",
            boxShadow: theme.shadows[10],
            ":hover": { backgroundColor: "hovergrey" },
          }}
          onClick={handleCloseModal}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" type="submit">
          Create
        </Button>
      </Box>
      <Loader open={open} />
    </form>
  );
}
