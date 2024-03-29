import { Box, Button, Card, Container, Grid, Link, TextField, Typography } from "@mui/material";
import { Auth } from "aws-amplify";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import homebg from "../assets/homebg.png";
import useAppBarHeight from "./utils/AppBarHeight";
import Loader from "./utils/Loader";

export default function SignIn({ userInfo, handleSetUserInfo }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const routes = {
    Admin: "/admin",
    SuperAdmin: "/superadmin",
    Teacher: "/teacher",
    User: "/home",
  };

  if (userInfo.role == "Admin") {
    navigate(routes[userInfo.role]);
  } else if (userInfo.role == "Teacher") {
    navigate(routes[userInfo.role]);
  } else if (userInfo.role == "User") {
    navigate(routes[userInfo.role]);
  } else if (userInfo.role == "SuperAdmin") {
    navigate(routes[userInfo.role]);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setOpen(true);
    const data = new FormData(event.currentTarget);

    if (data.get("email") == "" || data.get("password") == "") {
      toast.error("Please fill in all fields");
      setOpen(false);
      return;
    }

    Auth.signIn(data.get("email"), data.get("password"))
      .then((user) => {

        if (user.challengeName == "NEW_PASSWORD_REQUIRED") {
          navigate("/changepassword");
          return;
        }

        user.getSession((err, session) => {
          if (err) {
          }
          let groups = session.getIdToken().payload["cognito:groups"];
          let userRole = null;
          if (groups.includes("Admins")) {
            userRole = "Admin";
          } else if (groups.includes("Teachers")) {
            userRole = "Teacher";
          } else if (groups.includes("Users")) {
            userRole = "User";
          } else if (groups.includes("SuperAdmins")) {
            userRole = "SuperAdmin";
          }
          if (userRole != null) {
            let userInfo = {
              id: session.getIdToken().payload.sub,
              name: session.getIdToken().payload["custom:name"],
              email: session.getIdToken().payload.email,
              role: userRole,
              profileImage: session.getIdToken().payload["custom:profileImage"],
              token: session.getIdToken().jwtToken,
            };
            handleSetUserInfo(userInfo);
          }

          if (Object.keys(routes).includes(userRole)) {
            navigate(routes[userRole]);
            return;
          }
        });
      })
      .catch((err) => {
        toast.error(err.message);
        setOpen(false);
      });
  };

  return (
    <div style={{ background: `linear-gradient(45deg, rgba(76,204,212,0.3) 0%, rgba(120,194,236,1) 50%, rgba(76,204,212,0.303046218487395) 100%)`, height: `calc(100vh - ${useAppBarHeight()}px)` }}>
      <Container maxWidth="xl" sx={{ width: { xs: 1, sm: 0.9 } }}>
        <Grid container justifyContent="flex-end">
          <Grid item xs={12} md={8} sx={{ mt: 12, pr: 10, display: { xs: "none", md: "block" } }}>
            <Typography variant="h3" color="white" sx={{ textAlign: { xs: "center", sm: "left" } }}>
              Learn2Play Beyond Classroom
            </Typography>
            <Typography variant="body1" color="white" sx={{ textAlign: { xs: "center", sm: "left" } }}>
              Welcome to Learn2Play's Learning Management System!<br /><br />
              Our user-friendly and engaging LMS is designed to help you make the most of your musical journey. Easily access all of your course materials, submit homework, track your progress, and enjoy fun and interactive features like quizzes.
              Sign in to experience it now!
            </Typography>
            <img src={homebg} alt="" />
          </Grid>
          <Grid item xs={12} md={4} sx={{ mt: 12 }}>
            <Card variant="contained">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 5,
                }}>
                <Typography component="h1" variant="h5">
                  Sign in
                </Typography>
                <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit}>
                  <TextField margin="normal" required fullWidth id="email" label="Email" name="email" autoComplete="email" autoFocus />
                  <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="current-password" />
                  <Grid container sx={{ pl: 1, mt: 1, mb: 2 }}>
                    <Grid item xs>
                      <Link
                        onClick={() => {
                          navigate("resetpassword");
                        }}
                        variant="body2"
                        color="primary.dark">
                        Forgot password?
                      </Link>
                    </Grid>
                  </Grid>
                  <Button type="submit" fullWidth variant="contained">
                    Sign In
                  </Button>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
        <Loader open={open} />
      </Container>
    </div>
  );
}
