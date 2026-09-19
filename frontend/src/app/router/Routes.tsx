import { createBrowserRouter, Navigate } from "react-router";

import App from "../layout/App";
import HomePage from "../../features/home/HomePage";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import ActivityForm from "../../features/activities/form/ActivityForm";
import ActivityDetailPage from "../../features/activities/details/ActivityDetailPage";
import NotFound from "../../features/errors/NotFound";
import LoginForm from "../../features/account/LoginForm";
import RegisterForm from "../../features/account/RegisterForm";
import RequireAuth from "./RequireAuth";

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
        ],
      },
      { path: "not-found", element: <NotFound /> },
      { path: "login", element: <LoginForm /> },
      { path: "register", element: <RegisterForm /> },
      { path: "*", element: <Navigate replace to="/not-found" /> },
    ],
  },
]);
