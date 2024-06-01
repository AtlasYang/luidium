import { FaCamera } from "react-icons/fa6";

export default function CameraIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <FaCamera size={size} color={color} />;
}
