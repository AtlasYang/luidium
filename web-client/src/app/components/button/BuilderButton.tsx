import BuilderLogo from "@/asset/logos/builder-logo.png";
import Image from "next/image";

export default function BuilderButton({
  size,
  onClick,
}: {
  size: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: size / 2,
        border: "none",
        backgroundColor: "white",
      }}
    >
      <Image
        src={BuilderLogo}
        alt="Builder Logo"
        width={size - 3}
        height={size - 3}
        style={{
          borderRadius: size / 2,
        }}
      />
    </button>
  );
}
