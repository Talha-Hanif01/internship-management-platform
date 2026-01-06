"use client";

import { Layout, Menu, Button } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { roleMenus } from "./menu.config";

const { Header, Sider, Content } = Layout;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logoutUser } = useAuth();
  const role = user?.role?.toLowerCase();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) return null;

  const menuItems = roleMenus[role as keyof typeof roleMenus] || [];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
        />
      </Sider>

      {/* Main Layout */}
      <Layout>
        <Header
          style={{
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <strong>{user.role.toUpperCase()} PANEL</strong>
          <Button danger onClick={logoutUser}>
            Logout
          </Button>
        </Header>

        <Content style={{ padding: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
