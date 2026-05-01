"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MoistureChart from "../components/MoistureChart";
import SettingsPanel from "../components/SettingsPanel";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [currentMoisture, setCurrentMoisture] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/sheets');
        if (!res.ok) throw new Error('Failed to fetch data');
        const sheetData = await res.json();
        
        if (sheetData && sheetData.length > 0) {
          // Keep only the last 24 entries for the chart
          const recentData = sheetData.slice(-24);
          setData(recentData);
          setCurrentMoisture(recentData[recentData.length - 1].value);
        } else {
          setError('No data found in the spreadsheet.');
        }
      } catch (err) {
        console.error(err);
        setError('Error loading data. Make sure the Google App Script is updated.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
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

  if (error) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh", flexDirection: "column", gap: "20px" }}>
        <div style={{ color: "var(--danger-red)", fontSize: "1.2rem", textAlign: "center", background: "rgba(248, 81, 73, 0.1)", padding: "20px", borderRadius: "12px", maxWidth: "500px" }}>
          <p>{error}</p>
        </div>
        <button className="btn-primary" onClick={() => window.location.reload()}>Try Again</button>
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
