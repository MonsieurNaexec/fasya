import { Player } from "app/admin-app";
import { useMemo } from "react";
import logo from "./FASYA_logo_full_stroke_800x800.png";
import "./vote.css";

export default function Vote({
  players,
  voteFor,
  onVote,
}: {
  players: Player[];
  voteFor: number[];
  onVote: (voteFor: number[]) => void;
}) {
  const currentPlayers = useMemo(
    () => players.filter((p) => p.ingame),
    [players]
  );
  return (
    <div className="grow flex flex-col items-center justify-center">
      <div className="max-w-[10rem]">
        <img src={logo} className="w-full" />
      </div>
      <div className="grow flex flex-col py-2 gap-8 self-stretch items-stretch">
        {currentPlayers
          .filter((p) => p.ingame)
          .map((p) => (
            <div
              key={p.name}
              className={`grow rounded-xl p-4 border-2 ${
                voteFor.includes(p.id)
                  ? "border-amber-300 shadow-[0_0_20px_0_rgba(0,0,0,0.3)] shadow-amber-400/50"
                  : "border-slate-500"
              }`}
              onClick={() => {
                console.log(voteFor, p.id);
                if (voteFor.includes(p.id))
                  onVote(voteFor.filter((x) => x !== p.id));
                else if (voteFor.length < currentPlayers.length - 1)
                  onVote([...voteFor, p.id].sort((a, b) => a - b));
              }}
            >
              {p.name}
            </div>
          ))}
      </div>
      <div className="text-2xl sm:text-3xl py-8">
        C'est l'heure du vote! ({voteFor.length}/{currentPlayers.length - 1})
      </div>
      <div className="absolute bottom-0 right-0 left-0 timer h-2 bg-amber-400"></div>
    </div>
  );
}
