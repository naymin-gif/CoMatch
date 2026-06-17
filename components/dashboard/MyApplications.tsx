import { Check, X, ArrowRight, Hourglass } from "lucide-react";
import { Dashboard } from "@/utils/DashboardActions";

interface Props {
  outbound: Dashboard[];
}

export default function MyApplications({ outbound }: Props) {
  return (
    <div className="bg-blue-50 rounded-xl p-6 animate-in fade-in duration-300">
      <div className="space-y-3">
        {outbound.length === 0 ? (
          <p className="text-gray-500 italic">No applications sent yet.</p>
        ) : (
          outbound.map((app) => (
            <div key={app.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
              <div className="flex-1 font-medium text-gray-800">
                {app.posts?.title || "Unknown Project"}
                <span className="block text-sm text-gray-500 font-normal mt-1">
                  {app.posts?.spaces?.name || "Unknown Space"}
                </span>
              </div>
              
              <div className="flex flex-1 items-center justify-center gap-2 text-gray-600 border-x border-gray-200 px-4">
                {app.status === 'Pending' && <Hourglass className="w-4 h-4 text-yellow-500" />}
                {app.status === 'Approved' && <Check className="w-4 h-4 text-green-500" />}
                {app.status === 'Rejected' && <X className="w-4 h-4 text-red-500" />}
                <span className="text-sm font-medium">{app.status}</span>
              </div>

              <div className="flex-1 flex justify-end pl-4">
                <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition">
                  View Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}