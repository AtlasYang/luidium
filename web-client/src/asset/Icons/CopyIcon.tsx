import { PiCopySimple } from "react-icons/pi";

export default function CopyIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <PiCopySimple size={size} color={color} />;
}
