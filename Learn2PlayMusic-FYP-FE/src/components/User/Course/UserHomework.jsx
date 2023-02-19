import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme, Typography, Container, Card, Box, TextField, Link, Button, Breadcrumbs } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import UploadIcon from '@mui/icons-material/Upload';
import TransitionModal from '../../utils/TransitionModal';
import celebration from '../../../assets/celebration.png'

const UserHomework = () => {
  const course = {
    id: 1,
    title: "Grade 1 Piano",
    date: "21 Mar 2023",
    teacher: "Miss Felicia Ng"
  }

  const homework = {
    id: 1,
    title: "Homework 1",
    assignedDate: "1 feb 2023, 23:59pm ",
    dueDate: "10 feb 2023, 23:59pm"
  }

  const theme = useTheme();
  const navigate = useNavigate()
  const { homeworkId } = useParams()
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const handleClose = () => setOpen(false);
  const submit = () => {
    setSubmitted(true)
    setOpen(false)
  }

  return (
    <>
      <TransitionModal open={open} handleClose={handleClose}>
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          Submit your homework?
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <Button variant="contained" sx={{ backgroundColor: "lightgrey", color: 'black', boxShadow: theme.shadows[10], ":hover": { backgroundColor: "hovergrey" } }} onClick={handleClose}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={submit}>Yes</Button>
        </Box>
      </TransitionModal>

      <Container maxWidth="xl" sx={{ width: { xs: 1, sm: 0.9 } }}>
        <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" />} sx={{ mt: 3 }}>
          <Link underline="hover" color="inherit" sx={{ display: "flex", alignItems: "center" }} onClick={() => { navigate('/home') }}>
            <HomeIcon sx={{ mr: 0.5 }} />
            Home
          </Link>
          <Link underline="hover" color="inherit" onClick={() => { navigate('/home/course/1/homework') }}>
            {course.title}
          </Link>
          <Typography color="text.primary">Homework</Typography>
        </Breadcrumbs>

        <Card sx={{ py: 1.5, px: 3, mt: 2, display: { xs: "flex", sm: "flex" } }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box>
              <Typography variant='h5' sx={{ color: "primary.main" }}>{course.title}</Typography>
              <Typography variant='subtitle2' sx={{ mb: 1 }}>Date: {course.date}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
            <Box>
              <Typography variant='subtitle1' sx={{ mb: 0.5 }}>{course.teacher}</Typography>
              <Typography variant='body2' sx={{ textAlign: "right" }}>Teacher</Typography>
            </Box>
          </Box>
        </Card>

        <Box sx={{ display: submitted ? 'none' : 'block' }}>
          <Card sx={{ py: 3, px: 5, mt: 2 }}>
            <Typography variant='h6' sx={{ mb: 1 }}>{homework.title}</Typography>
            <Typography variant='body2'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sed delectus nostrum non rerum ut temporibus maiores totam molestias, quas unde eius officiis repellat, illum repudiandae earum, consectetur dicta facere ipsam.</Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
              <Box>
                <Typography variant='subtitle2' sx={{ mb: 0.5 }}>ASSIGNED DATE</Typography>
                <Typography variant='body2'>{homework.assignedDate}</Typography>
              </Box>
              <Box sx={{ ml: 4 }}>
                <Typography variant='subtitle2' sx={{ mb: 0.5 }}>DUE DATE</Typography>
                <Typography variant='body2'>{homework.dueDate}</Typography>
              </Box>
            </Box>
            <Typography variant='subtitle2' sx={{ mt: 3, mb: 0.5 }}>UPLOAD FILE</Typography>
            <Button variant="contained" sx={{ mb: 2, backgroundColor: "lightgrey", color: 'black', boxShadow: "none", ":hover": { backgroundColor: "hovergrey" } }}>ADD A FILE</Button>
            <br />
            <TextField label="Add Text" variant="outlined" rows={7} multiline fullWidth sx={{ mt: 2 }} />
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOpen(true)}><UploadIcon />SUBMIT</Button>
          </Card>
        </Box>

        <Box sx={{ display: submitted ? 'block' : 'none' }}>
          <Card sx={{ py: 3, px: 5, mt: 2 }}>
            <Typography variant='h6' sx={{ mb: 1 }}>{homework.title}</Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <img src={celebration}></img>
            </Box>
            <Typography variant='h5' sx={{ textAlign: "center" }}>Submission Successful!</Typography>
            <Box sx={{ mt:2, display: "flex", justifyContent: "center" }}>
              <Button variant="contained" onClick={() => navigate('/home/course/1/homework')}>Back to Homework</Button>
            </Box>
          </Card>
        </Box>

      </Container>
    </>
  )
}

export default UserHomework