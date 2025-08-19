import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Layout, Button, Drawer, Flex, Grid } from "antd";
import { SideBar } from "./sidebar";
import LogoIcon from "../assets/feliza-logo.png";
import Cookies from "js-cookie";
import {
  CloseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";

export const MainLayout: React.FC = () => {
  const { Header, Sider, Content } = Layout;
  const screens = Grid.useBreakpoint();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const navigate = useNavigate();

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev);
  };

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const handleLogout = () => {
    Cookies.remove("FELIZA-TOKEN");
    Cookies.remove("FELIZA-CUSTOMER-ID");
    navigate("/");
    toast.success("Tizimdan chiqdingiz!", { position: "top-center" });
  };

  return (
    <Layout style={{ minHeight: "100vh", overflow: "hidden" }}>
      <Sider
        className="hidden lg:block border-r"
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
      >
        <div
          className={"hidden md:flex justify-center items-center border-b h-16"}
        >
          <img
            src={LogoIcon}
            alt="Logo"
            className={`${
              collapsed ? "w-12 h-16" : "w-24 h-16"
            } transition-all duration-300 object-contain`}
          />
        </div>
        <SideBar collapsed={collapsed} closeDrawer={closeDrawer} />
      </Sider>

      <Layout>
        <Header
          className={"flex justify-between items-center sticky top-0 border-b"}
          style={{
            background: "white",
            padding: "0 16px",
          }}
        >
          <Button
            type="primary"
            className="lg:hidden"
            onClick={showDrawer}
            icon={<MenuUnfoldOutlined />}
            style={{
              display: screens?.lg ? "none" : "",
            }}
          />
          <Button
            type="primary"
            onClick={toggleCollapsed}
            style={{
              display: screens?.lg ? "" : "none",
            }}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          />

          <Button
            type="primary"
            icon={<LogoutOutlined />}
            onClick={() => handleLogout()}
          />
        </Header>

        <Content
          style={{
            height: "calc(100vh - 64px)",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "#2C3033 #F5F5F6",
            scrollBehavior: "smooth",
            padding: "12px",
          }}
        >
          <Outlet />
        </Content>

        <Drawer
          title={<Flex justify="center">Admin Menu</Flex>}
          placement="left"
          onClose={closeDrawer}
          open={drawerVisible}
          className="lg:hidden"
          styles={{
            header: {
              background: "#ccc",
              color: "black",
            },
            body: {
              padding: 0,
              background: "white",
            },
          }}
          closeIcon={
            <CloseOutlined className="bg-red-500 p-2 rounded-md text-white absolute right-4" />
          }
        >
          <div className="p-3">
            <SideBar collapsed={false} closeDrawer={closeDrawer} />
          </div>
        </Drawer>
      </Layout>
    </Layout>
  );
};
