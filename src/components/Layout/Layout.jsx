import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const Layout = () => {
     const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

     const accessToken = localStorage.getItem("access");
     const navigate = useNavigate();

     useEffect(() => {
          if (!accessToken) {
               navigate("/login", { replace: true });
          }
     }, [accessToken, navigate]);

     return (
          <div>

               {/* 
                   ===================== bu yerda sidebar va header bo'ladi. ========================
               */}

               <main
               // className={`${!sidebarCollapsed ? "w-[calc(100%-17rem)]" : "w-[calc(100%-5rem)]"} transition-all duration-500 ease-in-out ml-auto`}
               >
                    <Outlet />
               </main>
          </div>
     )
}

export default Layout