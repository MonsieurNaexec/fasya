import { useTimer } from "hooks/SocketProvider";

export const timeToString = (time: number) =>
  `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, "0")}`;

function Timer() {
  const timer = useTimer();
  const time = timeToString(timer);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="grid grid-cols-4 text-white text-[20rem]">
        <span className="text-center font-[likewise]">{time[0]}</span>
        <span className="text-center font-[likewise]">{time[1]}</span>
        <span className="text-center font-[likewise]">{time[2]}</span>
        <span className="text-center font-[likewise]">{time[3]}</span>
      </div>
    </div>
  );
}

export default Timer;
