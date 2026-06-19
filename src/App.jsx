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
  Settings,
  ReferencePage,
  PrivacyPolicy,
} from "./pages";
import Layout from "./components/Layout/Layout";
import { EmptySection } from "./components/EmptySection";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, check }) => {
  const userPermission = useSelector(
    (state) => state.references.userPermission
  );

  if (
    !userPermission ||
    Object.keys(userPermission).length === 0
  ) {
    return null;
  }

  return check ? children : <Navigate to="/" replace />;
};

const ProtectedReference = ({ children }) => {
  const { type } = useParams();

  const userPermission = useSelector(
    (state) => state.references.userPermission
  );

  if (
    !userPermission ||
    Object.keys(userPermission).length === 0
  ) {
    return null;
  }

  const permissionKey =
    type === "schedule" ? "schedules" : type;

  const hasAccess =
    userPermission?.[permissionKey]?.length > 0;

  return hasAccess ? children : <Navigate to="/" replace />;
};

const App = () => {
  const userPermission = useSelector(
    (state) => state.references.userPermission
  );

  const viewEmp =
    userPermission?.employees?.some(
      (e) => e.code === "employee_view_all"
    );

  const viewgeo =
    userPermission?.geozones?.some(
      (e) => e.code === "geozone_view"
    );

  const viewRep =
    userPermission?.reports?.some(
      (e) =>
        e.code === "report_type_employee" ||
        e.code === "report_type_branch"
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
              <Reports />
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