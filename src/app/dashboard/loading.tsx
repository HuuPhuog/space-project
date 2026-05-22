import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background min-h-screen">
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
        <span className="text-sm text-muted-foreground">Đang tải không gian làm việc...</span>
      </div>
    </div>
  );
}
