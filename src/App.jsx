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
} from "./pages";
import Layout from "./components/Layout/Layout";
import { EmptySection } from "./components/EmptySection";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, check }) => {
  const userPermission = useSelector(
    (state) => state.references.userPermission
  );

  if (!userPermission || Object.keys(userPermission).length === 0) {
    return null;
  }

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

const App = () => {
  const userPermission = useSelector(
    (state) => state.references.userPermission
  );

  const viewEmp = userPermission?.employees &&
    userPermission?.employees?.some(
      (e) => e.code === "employee_view_all" || e.code === "employee_view_district" ||
        e.code === "employee_view_region" || e.code === "employee_view_branch" ||
        e.code === "employee_view_dept"
    );

  const viewgeo = userPermission?.geozones &&
    userPermission?.geozones?.some((e) => e.code === "geozone_view");

  const viewAULog = userPermission?.logs &&
    userPermission?.logs?.some((e) => e.code === "log_view_audit");
  const viewSGLog = userPermission?.logs &&
    userPermission?.logs?.some((e) => e.code === "log_view_signature");
  const viewGPLog = userPermission?.logs &&
    userPermission?.logs?.some((e) => e.code === "log_view_gps");
  const viewFCLog = userPermission?.logs &&
    userPermission?.logs?.some((e) => e.code === "log_view_face");

  const viewRep = userPermission?.reports &&
    userPermission?.reports?.some(
      (e) => e.code === "report_type_employee" || e.code === "report_type_branch"
    );

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
            <ProtectedRoute check={viewEmp}>
              <EmployeeRegister />
            </ProtectedRoute>
          ),
        },

        {
          path: "reports",
          element: (
            <ProtectedRoute check={viewRep}>
              <Navigate to="/reports/general" replace />
            </ProtectedRoute>
          ),
        },
        {
          path: "reports/general",
          element: (
            <ProtectedRoute check={viewRep}>
              <Reports />
            </ProtectedRoute>
          ),
        },
        {
          path: "reports/kpi",
          element: (
            <ProtectedRoute check={viewRep}>
              <ReportsKPI />
            </ProtectedRoute>
          ),
        },
        {
          path: "reports/daily",
          element: (
            <ProtectedRoute check={viewRep}>
              <ReportsDaily />
            </ProtectedRoute>
          ),
        },
        {
          path: "reports/events",
          element: (
            <ProtectedRoute check={viewRep}>
              <ReportsEvents />
            </ProtectedRoute>
          ),
        },

        {
          path: "geozones",
          element: (
            <ProtectedRoute check={viewgeo}>
              <Geozones />
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
            <ProtectedRoute check={viewAULog}>
              <ActionHistory />
            </ProtectedRoute>
          ),
        },
        {
          path: "history/faceid",
          element: (
            <ProtectedRoute check={viewFCLog}>
              <FaceIdHistory />
            </ProtectedRoute>
          ),
        },
        {
          path: "history/location",
          element: (
            <ProtectedRoute check={viewGPLog}>
              <LocationHistory />
            </ProtectedRoute>
          ),
        },
        {
          path: "history/signature",
          element: (
            <ProtectedRoute check={viewSGLog}>
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

  return <RouterProvider router={router} />;
};

export default App;