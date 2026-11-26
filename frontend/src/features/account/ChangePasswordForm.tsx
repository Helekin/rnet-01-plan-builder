import { Password } from "@mui/icons-material";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";

import AccountFormWrapper from "./AccountFormWrapper";
import TextInput from "../../app/shared/components/TextInput";
import {
  changePasswordSchema,
  type ChangePasswordSchema,
} from "../../lib/schemas/changePasswordSchema";
import { useAccount } from "../../lib/hooks/useAccount";

export default function ChangePasswordForm() {
  const { changePassword } = useAccount();

  const onSubmit = async (data: ChangePasswordSchema) => {
    try {
      await changePassword.mutateAsync(data, {
        onSuccess: () => toast.success("Your password has been changed"),
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AccountFormWrapper<ChangePasswordSchema>
      title="Change password"
      icon={<Password fontSize="large" />}
      onSubmit={onSubmit}
      submitButtonText="Update password"
      resolver={zodResolver(changePasswordSchema)}
      reset={true}
    >
      <TextInput
        type="password"
        label="Current password"
        name="currentPassword"
      />
      <TextInput type="password" label="New password" name="newPassword" />
      <TextInput
        type="password"
        label="Confirm password"
        name="confirmPassword"
      />
    </AccountFormWrapper>
  );
}
