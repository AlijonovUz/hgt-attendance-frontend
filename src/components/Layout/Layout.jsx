import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import Navbar from "./Navbar";
import { axiosAPI } from "@/services/axiosAPI";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "@/store/slices/referencesSlice";

const Layout = () => {
     const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
     const dispatch = useDispatch()

     const accessToken = localStorage.getItem("access");
     const navigate = useNavigate();

     useEffect(() => {
          if (!accessToken) {
               navigate("/login", { replace: true });
          }
     }, [accessToken, navigate]);

     useEffect(() => {
          const getCurrentUser = async () => {
               try {
                    const res = await axiosAPI.get("users/auth/profile/")

                    if (res.status === 200) {
                         dispatch(setCurrentUser(res.data?.data))
                    }
               } catch (err) {
                    console.error(err);
               }
          }

          getCurrentUser()
     }, [])


     return (
          <div className="flex h-screen overflow-hidden">

               <Sidebar
                    setSidebarCollapsed={setSidebarCollapsed}
                    sidebarCollapsed={sidebarCollapsed}
               />

               <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    <Navbar
                         sidebarCollapsed={sidebarCollapsed}
                         setSidebarCollapsed={setSidebarCollapsed}
                    />

                    <main className="flex-1 overflow-y-auto">
                         <Outlet />
                    </main>
               </div>

          </div>
     )
}

export default Layout