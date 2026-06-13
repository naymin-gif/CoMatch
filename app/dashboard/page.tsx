"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js"; 
import {
  Dashboard,
  getMyApplications,
  getRequestsReceived,
  updateApplicationStatus,
} from "../../utils/DashboardActions";
import MyApplications from "@/components/dashboard/MyApplications";
import RequestsReceived from "@/components/dashboard/RequestsReceived";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type TabState = "inbound" | "outbound";

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [outbound, setOutbound] = useState<Dashboard[]>([]);
  const [inbound, setInbound] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabState>("inbound");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        setUserId(user.id);

        const [outboundData, inboundData] = await Promise.all([
          getMyApplications(supabase, user.id),
          getRequestsReceived(supabase, user.id),
        ]);

        setOutbound(outboundData);
        setInbound(inboundData);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const handleAction = async (appId: string, newStatus: 'Approved' | 'Rejected') => {
    if (!userId) return;
    
    // Optimistic UI update
    setInbound(prev => 
      prev.map(app => app.id === appId ? { ...app, status: newStatus } : app)
    );

    try {
      await updateApplicationStatus(supabase, appId, newStatus, userId);
    } catch (error) {
      console.error(error);
      alert("Failed to update status. Please try again.");
      const refresh = await getRequestsReceived(supabase, userId);
      setInbound(refresh);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* TABS NAVIGATION */}
      <div className="flex space-x-6 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("inbound")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "inbound"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Requests Received
        </button>
        <button
          onClick={() => setActiveTab("outbound")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "outbound"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          My Applications
        </button>
      </div>

      {/* TAB CONTENT RENDERING */}
      {activeTab === "inbound" && (
        <RequestsReceived inbound={inbound} handleAction={handleAction} />
      )}

      {activeTab === "outbound" && (
        <MyApplications outbound={outbound} />
      )}
    </div>
  );
}