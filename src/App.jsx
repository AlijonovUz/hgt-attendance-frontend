import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { HomePage, LoginPage, EmployeeRegister, Geozones, Reports, Settings, ReferencePage, PrivacyPolicy } from "./pages"
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
          path: "/references/:type",
          element: <ReferencePage />,
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
    {
      // Umumiy sahifa — login talab qilinmaydi (Layout'dan tashqarida)
      path: "/privacy-policy",
      element: <PrivacyPolicy />,
    },
  ])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App