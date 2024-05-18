import { Connection } from "app/admin-app";

const STATUS_COLOR: Record<string, string> = {
  OK: "bg-green-700",
};

export default function Guest({ connection }: { connection: Connection }) {
  return (
    <div className="flex flex-col rounded bg-slate-600 border border-slate-500 text-slate-200 items-stretch min-w-[3rem] overflow-hidden">
      <div className="border-b bg-slate-700 border-slate-500 text-center">
        {connection.number}
      </div>
      <div className={`text-center ${STATUS_COLOR[connection.status]}`}>
        {connection.vote.length
          ? `[${connection.vote.join()}]`
          : connection.status}
      </div>
    </div>
  );
}
