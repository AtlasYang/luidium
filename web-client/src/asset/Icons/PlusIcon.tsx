import { BiPlus } from "react-icons/bi";

export default function PlusIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <BiPlus size={size} color={color} />;
}
