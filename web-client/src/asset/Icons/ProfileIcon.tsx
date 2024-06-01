import { IoPersonCircleOutline } from "react-icons/io5";

export default function ProfileIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <IoPersonCircleOutline size={size} color={color} />;
}
