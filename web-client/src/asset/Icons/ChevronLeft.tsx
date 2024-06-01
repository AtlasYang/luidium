import { FaChevronLeft } from "react-icons/fa";

export default function ChevronLeft({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <FaChevronLeft size={size} color={color} />;
}
