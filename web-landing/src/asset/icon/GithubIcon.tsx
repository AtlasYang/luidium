import { FaGithub } from "react-icons/fa";

export default function GithubIcon({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return <FaGithub size={size} color={color} />;
}
