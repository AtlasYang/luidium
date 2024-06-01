import { LuLogOut } from "react-icons/lu";

export default function SignOutIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <LuLogOut size={size} color={color} />;
}
