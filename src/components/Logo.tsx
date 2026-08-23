export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="SV Wacker Burghausen eSports"
      className={`${className} object-contain`}
      draggable={false}
    />
  );
}
