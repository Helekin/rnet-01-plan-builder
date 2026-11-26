import { useNavigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { Typography } from "@mui/material";
import { LockOpen } from "@mui/icons-material";

import { useAccount } from "../../lib/hooks/useAccount";
import AccountFormWrapper from "./AccountFormWrapper";
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "../../lib/schemas/resetPasswordSchema";
import TextInput from "../../app/shared/components/TextInput";

export default function ResetPasswordForm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const { resetPassword } = useAccount();

  const email = params.get("email");
  const code = params.get("code");

  if (!email || !code)
    return <Typography>Invalid reset password code</Typography>;

  const onSubmit = async (data: ResetPasswordSchema) => {
    resetPassword.mutateAsync(
      { email, resetCode: code, newPassword: data.newPassword },
      {
        onSuccess: () => {
          toast.success("Password reset successfully - you can now sign in");
          navigate("/login");
        },
      },
    );
  };

  return (
    <AccountFormWrapper<ResetPasswordSchema>
      title="Reset your password"
      submitButtonText="Reset password"
      onSubmit={onSubmit}
      resolver={zodResolver(resetPasswordSchema)}
      icon={<LockOpen fontSize="large" />}
    >
      <TextInput label="New password" type="password" name="newPassword" />
      <TextInput
        label="Confirm password"
        type="password"
        name="confirmPassword"
      />
      v
    </AccountFormWrapper>
  );
}
