import { createBrowserRouter, Navigate } from "react-router";

import App from "../layout/App";
import RequireAuth from "./RequireAuth";
import HomePage from "../../features/home/HomePage";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import ActivityForm from "../../features/activities/form/ActivityForm";
import ActivityDetailPage from "../../features/activities/details/ActivityDetailPage";
import NotFound from "../../features/errors/NotFound";
import LoginForm from "../../features/account/LoginForm";
import RegisterForm from "../../features/account/RegisterForm";
import ProfilePage from "../../features/profiles/ProfilePage";
import VerifyEmail from "../../features/account/VerifyEmail";
import ChangePasswordForm from "../../features/account/ChangePasswordForm";
import ForgotPasswordForm from "../../features/account/ForgotPasswordForm";
import ResetPasswordForm from "../../features/account/ResetPasswordForm";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <RequireAuth />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "activities", element: <ActivityDashboard /> },
          { path: "activities/:id", element: <ActivityDetailPage /> },
          { path: "create-activity", element: <ActivityForm key="create" /> },
          { path: "manage/:id", element: <ActivityForm /> },
          { path: "profiles/:id", element: <ProfilePage /> },
          { path: "change-password", element: <ChangePasswordForm /> },
        ],
      },
      { path: "not-found", element: <NotFound /> },
      { path: "login", element: <LoginForm /> },
      { path: "register", element: <RegisterForm /> },
      { path: "confirm-email", element: <VerifyEmail /> },
      { path: "forgot-password", element: <ForgotPasswordForm /> },
      { path: "reset-password", element: <ResetPasswordForm /> },
      { path: "*", element: <Navigate replace to="/not-found" /> },
    ],
  },
]);
