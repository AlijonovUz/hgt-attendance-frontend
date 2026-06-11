import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { HomePage, LoginPage, EmployeeRegister, Geozones, Reports, Settings } from "./pages"
import Layout from "./components/Layout/Layout"
import { EmptySection } from "./components/EmptySection"

const App = () => {

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
        {
          path: "/employee-register",
          element: <EmployeeRegister />,
        },
        {
          path: "/reports",
          element: <Reports />,
        },
        {
          path: "/geozones",
          element: <Geozones />,
        },
        {
          path: "/settings",
          element: <Settings />,
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