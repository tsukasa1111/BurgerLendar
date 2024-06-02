import React, { Fragment, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Grid, TextField, Typography } from "@mui/material";
import { auth } from "../firebase/firebase";

const Auth = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  const Register = async () => {
    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential);
        navigate("/home");
      })
      .catch((error) => {
        alert(error.message);
        console.error(error);
      });
  };

  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.currentTarget.value);
  };
  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.currentTarget.value);
  };

  return (
    <Fragment>
      <Container maxWidth="xs" style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Grid container justifyContent="center" alignItems="center" height="calc(100vh - 120px)">
          <Typography variant="h4" gutterBottom>
            Log in
          </Typography>
          <Box component="form" style={{ width: "100%" }}>
            <TextField
              style={{ marginTop: "0.5em", marginBottom: "0.5em" }}
              name="email"
              label="E-mail"
              fullWidth
              variant="outlined"
              value={email}
              onChange={handleChangeEmail}
            />
            <TextField
              style={{ marginTop: "0.5em", marginBottom: "0.5em" }}
              name="password"
              label="Password"
              fullWidth
              variant="outlined"
              type="password"
              value={password}
              onChange={handleChangePassword}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              style={{ marginTop: "0.5em", marginBottom: "0.5em" }}
              onClick={Register}
            >
              新規登録
            </Button>
          </Box>
        </Grid>
      </Container>
    </Fragment>
  );
};

export default Auth;
