import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Paper, Typography } from "@mui/material";
import { LockOpen } from "@mui/icons-material";

import TextInput from "../../app/shared/components/TextInput";
import { loginSchema, type LoginSchema } from "../../lib/schemas/loginSchema";
import { useAccount } from "../../lib/hooks/useAccount";
import { useState } from "react";

export default function LoginForm() {
  const [notVerified, setNotVerified] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { loginUser, resendConfirmationEmail } = useAccount();
  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid, isSubmitting },
  } = useForm<LoginSchema>({
    mode: "onTouched",
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const email = watch("email");

  const handleResendEmail = async () => {
    await resendConfirmationEmail.mutateAsync({ email });
    setNotVerified(false);
  };

  const onSubmit = async (data: LoginSchema) => {
    await loginUser.mutateAsync(data, {
      onSuccess: () => {
        navigate(location.state?.from || "/activities");
      },
      onError: (error) => {
        if (error.message === "NorAllowed") {
          setNotVerified(true);
        }
      },
    });
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 3,
        gap: 3,
        maxWidth: "md",
        mx: "auto",
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          color: "secondary.main",
        }}
      >
        <LockOpen fontSize="large" />
        <Typography variant="h4">Sign in</Typography>
      </Box>
      <TextInput label="Email" control={control} name="email" />
      <TextInput
        label="Password"
        type="password"
        control={control}
        name="password"
      />
      <Button
        type="submit"
        loading={isSubmitting}
        disabled={!isValid}
        variant="contained"
        size="large"
      >
        Login
      </Button>
      {notVerified ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ textAlign: "center", color: "error" }}>
            Your email has not been verified. You can click the button to
            re-send the verification email
          </Typography>
          <Button
            disabled={resendConfirmationEmail.isPending}
            onClick={handleResendEmail}
          >
            Re-send email link
          </Button>
        </Box>
      ) : (
        <Typography sx={{ textAlign: "center" }}>
          Don't have an account?
          <Typography
            sx={{ ml: 2 }}
            component={Link}
            to="/register"
            color="primary"
          >
            Sign up
          </Typography>
        </Typography>
      )}
    </Paper>
  );
}
