export default function ConnectGmailButton({
  connected,
  onConnect,
}) {
  return (
    <button
      onClick={onConnect}
      disabled={connected}
      className={`px-5 py-3 rounded-lg font-semibold transition ${
        connected
          ? "bg-gray-400 text-white cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      }`}
    >
      {connected
        ? "Gmail Connected"
        : "Connect Gmail"}
    </button>
  );
}