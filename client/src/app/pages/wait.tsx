import logo from "./FASYA_logo_full_stroke_800x800.png";

export default function Wait({ statusText }: { statusText: string }) {
  return (
    <div className="grow flex flex-col items-center justify-center">
      <div className="max-w-xl">
        <img src={logo} className="w-full" />
      </div>
      <div className="text-2xl sm:text-4xl py-8">
        {statusText || "Chargement..."}
      </div>
    </div>
  );
}
