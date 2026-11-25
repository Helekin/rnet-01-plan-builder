import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import agent from "../api/agent";
import { useStore } from "./useStore";
import type { User } from "../types";
import { type LoginSchema } from "../schemas/loginSchema";
import type { RegisterSchema } from "../schemas/registerSchema";
import type { ChangePasswordSchema } from "../schemas/changePasswordSchema";

type LoginResponse = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
};

export const useAccount = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { userStore } = useStore();

  const { data: currentUser, isLoading: loadingUserInfo } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await agent.get<User>("/account/user-info");
      return response.data;
    },
    enabled: userStore.isLoggedIn,
  });

  const loginUser = useMutation({
    mutationFn: async (creds: LoginSchema) => {
      const response = await agent.post<LoginResponse>("/login", creds);
      return response.data;
    },
    onSuccess: async (data) => {
      userStore.setToken(data.accessToken);
      await queryClient.fetchQuery({
        queryKey: ["user"],
        queryFn: async () => {
          const response = await agent.get<User>("/account/user-info");
          return response.data;
        },
      });
    },
  });

  const registerUser = useMutation({
    mutationFn: async (creds: RegisterSchema) => {
      await agent.post("/account/register", creds);
    },
  });

  const logoutUser = useMutation({
    mutationFn: async () => {
      await agent.post("/account/logout");
    },
    onSuccess: () => {
      userStore.setToken(null);
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.removeQueries({ queryKey: ["activities"] });
      navigate("/");
    },
  });

  const verifyEmail = useMutation({
    mutationFn: async ({ userId, code }: { userId: string; code: string }) => {
      await agent.get(`/confirmEmail?userId=${userId}&code=${code}`);
    },
  });

  const resendConfirmationEmail = useMutation({
    mutationFn: async ({
      email,
      userId,
    }: {
      email?: string;
      userId?: string | null;
    }) => {
      await agent.get(`/account/resendConfirmEmail`, {
        params: { email, userId },
      });
    },
    onSuccess: () => {
      toast.success("Email sent - please check your email");
    },
  });

  const changePassword = useMutation({
    mutationFn: async (data: ChangePasswordSchema) => {
      await agent.post("/account/change-password", data);
    },
  });

  return {
    loginUser,
    currentUser,
    logoutUser,
    loadingUserInfo,
    registerUser,
    verifyEmail,
    resendConfirmationEmail,
    changePassword,
  };
};
