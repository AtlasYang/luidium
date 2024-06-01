import { TiDelete } from "react-icons/ti";

export default function DeleteIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <TiDelete size={size} color={color} />;
}
