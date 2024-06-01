import { MdClose } from "react-icons/md";

export default function CloseButton({
  onClick,
  size,
  color,
}: {
  onClick: () => void;
  size: number;
  color: string;
}) {
  return (
    <div onClick={onClick}>
      <MdClose size={size} color={color} />
    </div>
  );
}
