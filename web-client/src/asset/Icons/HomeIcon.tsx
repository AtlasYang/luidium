import { FaHome } from "react-icons/fa";

export default function HomeIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <FaHome size={size} color={color} />;
}
