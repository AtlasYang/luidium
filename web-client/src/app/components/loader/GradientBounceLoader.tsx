import "@/styles/loaders/GradientBounceLoader.css";

export default function GradientBounceLoader({ size }: { size: number }) {
  return (
    <div className="loader" style={{ width: size, height: size }}>
      <div className="circle"></div>
      <div className="circle"></div>
      <div className="circle"></div>
    </div>
  );
}
