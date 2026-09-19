import { Navigate, Outlet, useLocation } from "react-router";
import { Typography } from "@mui/material";

import { useAccount } from "../../lib/hooks/useAccount";

export default function RequireAuth() {
  const location = useLocation();

  const { currentUser, loadingUserInfo } = useAccount();

  if (loadingUserInfo) return <Typography>Loading...</Typography>;

  if (!currentUser) return <Navigate to="/login" state={{ from: location }} />;

  return <Outlet />;
}
