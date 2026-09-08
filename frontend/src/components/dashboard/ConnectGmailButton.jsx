import { Mail } from 'lucide-react';

export default function ConnectGmailButton() {
  const handleConnect = () => {
    window.open('http://localhost:8000/auth/gmail', '_blank');
  };

  return (
    <button
      onClick={handleConnect}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-primary-500 text-primary-700 dark:text-primary-400 font-semibold text-sm hover:bg-primary-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
    >
      <Mail className="w-4 h-4" />
      Connect Gmail
    </button>
  );
}
