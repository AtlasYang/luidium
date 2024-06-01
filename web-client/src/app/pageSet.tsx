import { ReactNode } from "react";
import DashboardHome from "./home/DashboardHome";
import ProfileScreen from "./profile/ProfileScreen";
import SettingScreen from "./settings/SettingScreen";
import HomeIcon from "@/asset/Icons/HomeIcon";
import ProfileIcon from "@/asset/Icons/ProfileIcon";
import SettingsIcon from "@/asset/Icons/SettingsIcon";

export const DashboardPages: {
  name: string;
  icon: ReactNode;
  component: ReactNode;
}[] = [
  {
    name: "Home",
    icon: <HomeIcon size={20} color="#000" />,
    component: <DashboardHome />,
  },
  {
    name: "Profile",
    icon: <ProfileIcon size={20} color="#000" />,
    component: <ProfileScreen />,
  },
  {
    name: "Settings",
    icon: <SettingsIcon size={20} color="#000" />,
    component: <SettingScreen />,
  },
];
