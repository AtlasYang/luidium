import { MdApps } from "react-icons/md";

export default function AppIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <MdApps size={size} color={color} />;
}
