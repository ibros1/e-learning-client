import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
    </div>
  );
}
