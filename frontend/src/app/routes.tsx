import { createBrowserRouter } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { PatientDashboard } from "./pages/PatientDashboard";
import { DoctorDashboard } from "./pages/DoctorDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/patient",
    Component: PatientDashboard,
  },
  {
    path: "/doctor",
    Component: DoctorDashboard,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
]);
