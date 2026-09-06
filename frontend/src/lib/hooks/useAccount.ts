import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type LoginSchema } from "../schemas/loginSchema";
import agent from "../api/agent";
import { useStore } from "./useStore";
import type { User } from "../types";

type LoginResponse = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
};

export const useAccount = () => {
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

  const { data: currentUser } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await agent.get<User>("/account/user-info");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    loginUser,
    currentUser,
  };
};
