import { ReactNode } from "react";
import AppPage from "./appPage/AppPage";
import Blueprints from "./blueprint/Blueprints";
import DashboardIcon from "@/asset/Icons/DashboardIcon";
import DashboardIcon18 from "@/asset/Icons/custom/DashboardIcon18";
import Forge from "./forge/Forge";
import LogPage from "./logPage/LogPage";
import VersionManager from "./versionManager/VersionManager";

export const ApplicationPages: { name: string; component: ReactNode }[] = [
  {
    name: "Overview",
    component: <AppPage />,
  },
  {
    name: "Forge",
    component: <Forge />,
  },
  {
    name: "Version Manager",
    component: <VersionManager />,
  },
  // {
  //   name: "Blueprints",
  //   component: <Blueprints />,
  // },
  {
    name: "Logs",
    component: <LogPage />,
  },
];

export const FooterItems: { name: string; route: string; icon: ReactNode }[] = [
  // {
  //   name: "Dashboard",
  //   route: "/",
  //   icon: <DashboardIcon18 />,
  // },
];
