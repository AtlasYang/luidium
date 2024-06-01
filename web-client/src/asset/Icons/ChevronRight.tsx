import { FaChevronRight } from "react-icons/fa";

export default function ChevronRight({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <FaChevronRight size={size} color={color} />;
}
