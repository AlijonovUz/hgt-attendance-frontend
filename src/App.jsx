import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useParams,
} from "react-router-dom";
import {
  HomePage,
  LoginPage,
  EmployeeRegister,
  Geozones,
  Reports,
  ReportsKPI,
  ReportsDaily,
  ReportsEvents,
  Settings,
  ReferencePage,
  PrivacyPolicy,
  ActionHistory,
  FaceIdHistory,
  LocationHistory,
  SignatureHistory,
  HolidayCalendar,
} from "./pages";
import Layout from "./components/Layout/Layout";
import { EmptySection } from "./components/EmptySection";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, checkFn }) => {
  const userPermission = useSelector(
    (state) => state.references.userPermission
  );

  if (!userPermission || Object.keys(userPermission).length === 0) {
    return null;
  }

  const check = checkFn ? checkFn(userPermission) : false;
  return check ? children : <Navigate to="/" replace />;
};

const ProtectedReference = ({ children }) => {
  const { type } = useParams();

  const userPermission = useSelector(
    (state) => state.references.userPermission
  );

  if (!userPermission || Object.keys(userPermission).length === 0) {
    return null;
  }

  const permissionKey = type === "schedule" ? "schedules" : type;
  const hasAccess = userPermission?.[permissionKey]?.length > 0;

  return hasAccess ? children : <Navigate to="/" replace />;
};

// Check helpers
const checkViewEmp = (perms) =>
  perms?.employees &&
  perms.employees.some(
    (e) =>
      e.code === "employee_view_all" ||
      e.code === "employee_view_district" ||
      e.code === "employee_view_region" ||
      e.code === "employee_view_branch" ||
      e.code === "employee_view_dept"
  );

const checkViewGeo = (perms) =>
  perms?.geozones && perms.geozones.some((e) => e.code === "geozone_view");

const checkViewHoliday = (perms) =>
  perms?.holidays && perms.holidays.some((e) => e.code === "holiday_view");

const checkViewAULog = (perms) =>
  perms?.logs && perms.logs.some((e) => e.code === "log_view_audit");

const checkViewSGLog = (perms) =>
  perms?.logs && perms.logs.some((e) => e.code === "log_view_signature");

const checkViewGPLog = (perms) =>
  perms?.logs && perms.logs.some((e) => e.code === "log_view_gps");

const checkViewFCLog = (perms) =>
  perms?.logs && perms.logs.some((e) => e.code === "log_view_face");

const checkViewRep = (perms) =>
  perms?.reports &&
  perms.reports.some(
    (e) => e.code === "report_type_employee" || e.code === "report_type_branch"
  );

const checkViewRepKPI = (perms) => perms?.kpis;
const checkViewRepDaily = (perms) => perms?.dailys;
const checkViewRepEvents = (perms) => perms?.reports;

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <EmptySection />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "employee-register",
        element: (
          <ProtectedRoute checkFn={checkViewEmp}>
            <EmployeeRegister />
          </ProtectedRoute>
        ),
      },

      {
        path: "reports",
        element: (
          <ProtectedRoute checkFn={checkViewRep}>
            <Navigate to="/reports/general" replace />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports/general",
        element: (
          <ProtectedRoute checkFn={checkViewRep}>
            <Reports />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports/kpi",
        element: (
          <ProtectedRoute checkFn={checkViewRepKPI}>
            <ReportsKPI />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports/daily",
        element: (
          <ProtectedRoute checkFn={checkViewRepDaily}>
            <ReportsDaily />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports/events",
        element: (
          <ProtectedRoute checkFn={checkViewRepEvents}>
            <ReportsEvents />
          </ProtectedRoute>
        ),
      },

      {
        path: "geozones",
        element: (
          <ProtectedRoute checkFn={checkViewGeo}>
            <Geozones />
          </ProtectedRoute>
        ),
      },
      {
        path: "references/holiday-calendar",
        element: (
          <ProtectedRoute checkFn={checkViewHoliday}>
            <HolidayCalendar />
          </ProtectedRoute>
        ),
      },
      {
        path: "references/:type",
        element: (
          <ProtectedReference>
            <ReferencePage />
          </ProtectedReference>
        ),
      },
      {
        path: "history/actions",
        element: (
          <ProtectedRoute checkFn={checkViewAULog}>
            <ActionHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: "history/faceid",
        element: (
          <ProtectedRoute checkFn={checkViewFCLog}>
            <FaceIdHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: "history/location",
        element: (
          <ProtectedRoute checkFn={checkViewGPLog}>
            <LocationHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: "history/signature",
        element: (
          <ProtectedRoute checkFn={checkViewSGLog}>
            <SignatureHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/privacy-policy",
    element: <PrivacyPolicy />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
