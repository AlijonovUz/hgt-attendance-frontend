import { useEffect, useState, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import Navbar from "./Navbar";
import { axiosAPI } from "@/services/axiosAPI";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentUser, setRegions, setUserPermission } from "@/store/slices/referencesSlice";

const Layout = () => {
     const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
     const dispatch = useDispatch();
     const accessToken = localStorage.getItem("access");
     const navigate = useNavigate();

     const [loading, setLoading] = useState(true);

     const [roles, setRoles] = useState([]);
     const currentUser = useSelector((state) => state.references.currentUser);

     useEffect(() => {
          if (!accessToken) {
               navigate("/login", { replace: true });
          }
     }, [accessToken, navigate]);

     const getRegions = async () => {
          try {
               const res = await axiosAPI.get("users/regions/");
               if (res.status === 200) {
                    dispatch(setRegions(res.data?.data?.results));
               }
          } catch (err) {
               console.error(err);
          }
     };

     const getRoles = async () => {
          try {
               const res = await axiosAPI.get("users/roles/");
               if (res.status === 200) {
                    setRoles(res.data?.data?.results);
               }
          } catch (err) {
               console.error(err);
          }
     };

     const getCurrentUser = async () => {
          setLoading(true)
          try {
               const res = await axiosAPI.get("users/auth/profile/");
               if (res.status === 200) {
                    dispatch(setCurrentUser(res.data?.data));
               }
          } catch (err) {
               console.error(err);
               localStorage.removeItem("access");
               localStorage.removeItem("refresh");
               dispatch(setCurrentUser(null));
               navigate("/login", { replace: true });
          } finally {
               setLoading(false)
          }
     };

     useEffect(() => {
          if (accessToken) {
               getCurrentUser();
               getRoles();
               getRegions();
          }
     }, [accessToken]);

     const findRole = useMemo(() => {
          if (!roles.length || !currentUser?.role_info?.id) return null;
          return roles.find(r => r.id === currentUser.role_info.id);
     }, [roles, currentUser]);

     useEffect(() => {
          if (findRole) {
               const permissions = findRole?.permissions_info;
               dispatch(setUserPermission(permissions));
          }
     }, [findRole, dispatch, navigate]);

     if (loading) {
          return (
               <div className="h-screen flex items-center justify-center">
                    Loading...
               </div>
          );
     }

     return (
          <div className="flex h-screen overflow-hidden">
               <Sidebar setSidebarCollapsed={setSidebarCollapsed} sidebarCollapsed={sidebarCollapsed} />
               <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    <Navbar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
                    <main className="flex-1 overflow-y-auto">
                         <Outlet />
                    </main>
               </div>
          </div>
     );
};

export default Layout;