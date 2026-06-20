import { useState } from "react";
import { Check, X, MessageSquare } from "lucide-react";
import { Dashboard } from "@/utils/DashboardActions";

interface Props {
  inbound: Dashboard[];
  handleAction: (appId: string, status: 'Approved' | 'Rejected') => Promise<void>;
}

export default function RequestsReceived({ inbound, handleAction }: Props) {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  return (
    <div className="bg-blue-50 rounded-xl p-6 animate-in fade-in duration-300">
      <div className="space-y-3">
        {inbound.length === 0 ? (
          <p className="text-gray-500 italic">No inbound requests yet.</p>
        ) : (
          inbound.map((app) => (
            <div key={app.id} className="flex items-center bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
              
              {/* Applicant Info */}
              <div className="flex-1 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                  {app.profiles?.name?.charAt(0) || "?"}
                </div>
                <div>
                  <span className="block font-medium text-gray-800">{app.profiles?.name || "Unknown User"}</span>
                </div>
              </div>

              {/* Post Info & Message */}
              <div className="flex-[1.5] flex items-center justify-between pr-6 border-r border-gray-200">
                <span className="text-sm font-medium text-gray-600 truncate mr-4">
                  {app.posts?.title} {">"}
                </span>
                <button 
                  onClick={() => setSelectedMessage(app.intro_message || "No message provided.")}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                >
                  View Message <MessageSquare className="w-4 h-4" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex-1 flex justify-end gap-6 pl-6">
                {app.status === 'Pending' ? (
                  <>
                    <button 
                      onClick={() => handleAction(app.id, 'Approved')}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center justify-center group-hover:bg-green-100 transition">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">Accept</span>
                    </button>
                    <button 
                      onClick={() => handleAction(app.id, 'Rejected')}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center group-hover:bg-red-100 transition">
                        <X className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">Reject</span>
                    </button>
                  </>
                ) : (
                  <span className={`text-sm font-bold ${app.status === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>
                    {app.status}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MESSAGE MODAL */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Applicant Message</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 min-h-[100px] whitespace-pre-wrap">
              {selectedMessage}
            </p>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedMessage(null)}
                className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}