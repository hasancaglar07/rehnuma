export function BackgroundGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage: `
          radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #84144f 100%)
        `,
        backgroundSize: "100% 100%",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat"
      }}
    />
  );
}
