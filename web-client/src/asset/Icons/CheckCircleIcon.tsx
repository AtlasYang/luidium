import { FaCheckCircle } from "react-icons/fa";

export default function CheckCircleIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <FaCheckCircle size={size} color={color} />;
}
