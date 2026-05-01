"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MoistureChart from "../components/MoistureChart";
import SettingsPanel from "../components/SettingsPanel";

// Mock data for demonstration until Google Sheets API is hooked up
const MOCK_DATA = Array.from({ length: 24 }).map((_, i) => {
  const d = new Date();
  d.setHours(d.getHours() - (23 - i));
  return {
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    value: Math.max(20, Math.min(100, 60 + Math.sin(i / 3) * 30 + (Math.random() * 10 - 5)))
  };
});

export default function Dashboard() {
  const [data, setData] = useState(MOCK_DATA);
  const [currentMoisture, setCurrentMoisture] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setCurrentMoisture(Math.round(MOCK_DATA[MOCK_DATA.length - 1].value));
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleLogout = async () => {
    // To logout, we clear the cookie. For a full implementation, we'd have a logout API route.
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  const handleSaveSettings = async (newHysteresis) => {
    console.log("Saving hysteresis:", newHysteresis);
    // Here we will call the API to write to Google Sheets
  };

  if (isLoading) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <div className="text-gradient" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <main className="container animate-fade-in">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: "2.5rem" }}>Plant Dashboard</h1>
          <p style={{ color: "#8b949e", marginTop: "8px" }}>Real-time monitoring and control for your ESP32 system.</p>
        </div>
        <button className="btn-danger" onClick={handleLogout}>Sign Out</button>
      </header>

      <div className="grid-2">
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <h2 style={{ color: "#8b949e", fontSize: "1.2rem", marginBottom: "16px" }}>Current Moisture</h2>
          <div style={{ 
            fontSize: "4rem", 
            fontWeight: "bold", 
            color: currentMoisture < 40 ? "var(--danger-red)" : "var(--primary-green)",
            textShadow: currentMoisture < 40 ? "0 0 20px rgba(248, 81, 73, 0.4)" : "0 0 20px rgba(46, 160, 67, 0.4)"
          }}>
            {currentMoisture}%
          </div>
          <p style={{ marginTop: "16px", fontWeight: "500" }}>
            {currentMoisture < 40 ? "Needs Watering soon!" : "Optimal conditions"}
          </p>
        </div>

        <div className="glass-panel">
          <h2 style={{ marginBottom: "16px", fontSize: "1.2rem" }}>Moisture History (Last 24h)</h2>
          <MoistureChart data={data} />
        </div>
      </div>

      <SettingsPanel currentHysteresis={40} onSave={handleSaveSettings} />
    </main>
  );
}
