import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

export const roleMenus = {
  hr: [
    {
      key: "/protected/hr/dashboard",
      label: "HR Dashboard",
      icon: <TeamOutlined />,
    },
  ],

  mentor: [
    {
      key: "/protected/mentor/dashboard",
      label: "Mentor Dashboard",
      icon: <UserOutlined />,
    },
  ],

  intern: [
    {
      key: "/protected/intern/dashboard",
      label: "Intern Dashboard",
      icon: <FileTextOutlined />,
    },
  ],
};
