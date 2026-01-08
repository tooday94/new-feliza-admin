import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Flex, Menu } from "antd";
import {
  EyeOutlined,
  LayoutOutlined,
  PercentageOutlined,
  PieChartOutlined,
  ProductOutlined,
  SettingOutlined,
  ShoppingOutlined,
  SoundOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "Asosiy",
    items: [
      {
        key: "/admin/orders",
        icon: <ShoppingOutlined />,
        label: "Buyurtmalar",
      },
      {
        key: "/admin/products",
        icon: <ProductOutlined />,
        label: "Mahsulotlar",
      },
      {
        key: "/admin/interfaces",
        icon: <LayoutOutlined />,
        label: "Interfaces",
      },
      {
        key: "/admin/settings",
        icon: <SettingOutlined />,
        label: "Sozlamalar",
      },
    ],
  },
  {
    title: "Boshqa",
    items: [
      { key: "/admin/users", icon: <TeamOutlined />, label: "Mijozlar" },
      { key: "/admin/admins", icon: <TeamOutlined />, label: "Adminlar" },
      {
        key: "/admin/sales",
        icon: <PercentageOutlined />,
        label: "Chegirmalar",
      },
      {
        key: "/admin/notifications",
        icon: <SoundOutlined />,
        label: "Bildirishnomalar",
      },
      {
        key: "/admin/review",
        icon: <EyeOutlined />,
        label: "Sharhlar",
      },
      {
        key: "/admin/kassa",
        icon: <ShoppingOutlined />,
        label: "Kassa",
      },
      {
        key: "/admin/messages",
        icon: <SoundOutlined />,
        label: "Xabarlar",
      },
      {
        key: "/admin/dashboard",
        icon: <PieChartOutlined />,
        label: "Statistika",
      },
    ],
  },
];

interface SideBarProps {
  collapsed: boolean;
  closeDrawer?: () => void;
}

export const SideBar: React.FC<SideBarProps> = ({ collapsed, closeDrawer }) => {
  const location = useLocation();

  const handleMenuItemClick = () => {
    if (closeDrawer) closeDrawer();
  };

  const renderMenuItems = (items: MenuItem[]): MenuProps["items"] =>
    items.map(({ key, icon, label }) => ({
      key,
      icon,
      label: (
        <Link to={key} onClick={handleMenuItemClick}>
          {label}
        </Link>
      ),
      style: {
        color: location.pathname === key ? "white" : "#0D0D0D",
        backgroundColor: location.pathname === key ? "#0D0D0D" : "white",
      },
    }));

  return (
    <Flex vertical gap={12} className={`h-full p-1`}>
      {menuSections.map(({ title, items }) => (
        <div key={title}>
          <h1
            className={`px-4 pt-1 text-secondary font-semibold text-sm ${
              collapsed ? "text-center" : ""
            }`}
          >
            {title}
          </h1>
          <Menu
            theme="light"
            mode={collapsed ? "vertical" : "inline"}
            selectedKeys={[location.pathname]}
            className={`border-b !py-1 !bg-white`}
            items={renderMenuItems(items)}
          />
        </div>
      ))}
    </Flex>
  );
};
