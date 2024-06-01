import { SiReact } from "react-icons/si";

export default function ReactIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <SiReact size={size} color={color} />;
}
