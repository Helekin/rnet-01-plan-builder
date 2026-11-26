import type { FieldValues } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import { useAccount } from "../../lib/hooks/useAccount";
import AccountFormWrapper from "./AccountFormWrapper";
import { LockOpen } from "@mui/icons-material";
import TextInput from "../../app/shared/components/TextInput";

export default function ForgotPasswordForm() {
  const navigate = useNavigate();

  const { forgotPassword } = useAccount();

  const onSubmit = async (data: FieldValues) => {
    try {
      await forgotPassword.mutateAsync(data.email, {
        onSuccess: () => {
          toast.success("Password reset requested - please check your email");
          navigate("/login");
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AccountFormWrapper
      title="Please enter your email address"
      icon={<LockOpen fontSize="large" />}
      submitButtonText="Request password reset link"
      onSubmit={onSubmit}
    >
      <TextInput
        rules={{ required: true }}
        label="Email address"
        name="email"
      />
    </AccountFormWrapper>
  );
}
