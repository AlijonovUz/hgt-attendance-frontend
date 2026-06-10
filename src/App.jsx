import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { HomePage, LoginPage } from "./pages"
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