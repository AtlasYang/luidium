import { IoSettingsOutline } from "react-icons/io5";

export default function SettingsIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <IoSettingsOutline size={size} color={color} />;
}
