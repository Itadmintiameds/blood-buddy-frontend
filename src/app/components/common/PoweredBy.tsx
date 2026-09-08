import Image from "next/image";

export function PoweredBy() {
  return (
    <div className="mt-10 flex items-center justify-center gap-1 text-center">
      <span className="text-[9px] font-medium text-[#3B0B85]">Powered by</span>
      <Image
        src="/images/tiameds-logo.png"
        alt="TiaMeds"
        width={110}
        height={43}
        className="h-auto w-[92px] object-contain"
      />
    </div>
  );
}
