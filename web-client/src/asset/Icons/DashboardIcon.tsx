import { RiDashboardLine } from "react-icons/ri";

export default function DashboardIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <RiDashboardLine size={size} color={color} />;
}
