import React from "react";

export const routes = [
  {
    path: "dashboard",
    element: React.lazy(() => import("../pages/dashboard/dashboard")),
  },
  {
    path: "products",
    element: React.lazy(() => import("../pages/products/products")),
  },
  {
    path: "create-product",
    element: React.lazy(() => import("../pages/products/create-product")),
  },
  {
    path: "create-billz-product",
    element: React.lazy(() => import("../pages/products/create-billz-product")),
  },
  {
    path: "update-product/:id",
    element: React.lazy(() => import("../pages/products/update-product")),
  },
  {
    path: "orders",
    element: React.lazy(() => import("../pages/orders/orders")),
  },
  {
    path: "order-detail/:id",
    element: React.lazy(() => import("../pages/orders/order-detail")),
  },
  {
    path: "notifications",
    element: React.lazy(() => import("../pages/notifications/notifications")),
  },
  {
    path: "settings",
    element: React.lazy(() => import("../pages/settings/settings")),
  },
  {
    path: "sales",
    element: React.lazy(() => import("../pages/sales/sales")),
  },
  {
    path: "users",
    element: React.lazy(() => import("../pages/users/users")),
  },
  {
    path: "user-detail/:id",
    element: React.lazy(() => import("../pages/users/user-detailPage")),
  },
  {
    path: "admins",
    element: React.lazy(() => import("../pages/admins/admins")),
  },
  {
    path: "interfaces",
    element: React.lazy(() => import("../pages/interfaces/interfaces")),
  },
  {
    path: "review",
    element: React.lazy(() => import("../pages/review/review")),
  },
  {
    path: "today-users",
    element: React.lazy(() => import("../pages/users/today-users")),
  },
  {
    path: "kassa",
    element: React.lazy(() => import("../pages/kassa/kassa")),
  },
];
