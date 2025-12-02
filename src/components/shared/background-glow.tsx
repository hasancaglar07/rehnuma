export function BackgroundGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #841450 100%)
          `,
          backgroundSize: "100% 100%",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
          mixBlendMode: "normal",
          opacity: 1
        }}
      />
    </div>
  );
}
