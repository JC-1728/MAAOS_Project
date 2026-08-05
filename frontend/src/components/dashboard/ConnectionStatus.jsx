export default function ConnectionStatus({ connected }) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm ${
        connected
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      <div
        className={`w-3 h-3 rounded-full ${
          connected ? "bg-green-500" : "bg-red-500"
        }`}
      ></div>

      {connected
        ? "Gmail Connected"
        : "Gmail Not Connected"}
    </div>
  );
}