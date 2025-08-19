import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

type AuthToken = string | null;

export const ProtectedRoute: React.FC = () => {
  const user: AuthToken = Cookies.get("FELIZA-TOKEN") || null;

  useEffect(() => {
    if (!user) {
      toast.info("Iltimos, avval tizimga kiring!", { position: "top-center" });
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
