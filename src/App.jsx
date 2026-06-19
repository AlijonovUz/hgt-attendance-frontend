import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { HomePage, LoginPage, EmployeeRegister, Geozones, Reports, Settings, Profile, ReferencePage } from "./pages"
import Layout from "./components/Layout/Layout"
import { EmptySection } from "./components/EmptySection"
import { useSelector } from "react-redux"

const App = () => {

  const userPermission = useSelector((state) => state.references.userPermission)

  const viewEmp = userPermission?.employees && userPermission?.employees.some(e => e.code === "employee_view_all")
  const viewgeo = userPermission?.geozones && userPermission?.geozones.some(e => e.code === "geozone_view")
  const viewRep = userPermission?.reports && userPermission?.reports.some(e => (e.code === "report_type_employee" || e.code === "report_type_branch"))

  const router = createBrowserRouter([
    {
      path: "",
      element: <Layout />,
      errorElement: <EmptySection />,
      children: [
        {
          path: "",
          element: <HomePage />,
        },
        ...(viewEmp ? [{
          path: "/employee-register",
          element: <EmployeeRegister />,
        }] : []),
        ...(viewRep ? [{
          path: "/reports",
          element: <Reports />,
        }] : []),
        ...(viewgeo ? [{
          path: "/geozones",
          element: <Geozones />,
        }] : []),
        {
          path: "/references/:type",
          element: <ReferencePage />,
        },
        {
          path: "/settings",
          element: <Settings />,
        },
        {
          path: "/profile",
          element: <Profile />,
        },
      ]
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
  ])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App