import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { type LoginSchema } from "../schemas/loginSchema";
import agent from "../api/agent";
import { useStore } from "./useStore";
import type { User } from "../types";
import type { RegisterSchema } from "../schemas/registerSchema";
import { toast } from "react-toastify";

type LoginResponse = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
};

export const useAccount = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { userStore } = useStore();

  const loginUser = useMutation({
    mutationFn: async (creds: LoginSchema) => {
      const response = await agent.post<LoginResponse>("/login", creds);
      return response.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["user"],
      });
      userStore.setToken(data.accessToken);
    },
  });

  const registerUser = useMutation({
    mutationFn: async (creds: RegisterSchema) => {
      await agent.post("/account/register", creds);
    },
    onSuccess: () => {
      toast.success("Register successful - You can now login");
      navigate("/login");
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

  const { data: currentUser, isLoading: loadingUserInfo } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await agent.get<User>("/account/user-info");
      return response.data;
    },
    enabled: userStore.isLoggedIn,
  });

  return {
    loginUser,
    currentUser,
    logoutUser,
    loadingUserInfo,
    registerUser,
  };
};
