"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MoistureChart from "../components/MoistureChart";
import SettingsPanel from "../components/SettingsPanel";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [currentMoisture, setCurrentMoisture] = useState(0);
  const [savedHysteresis, setSavedHysteresis] = useState(40);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/sheets');
        if (!res.ok) throw new Error('Failed to fetch data');
        const jsonResponse = await res.json();
        
        // Nu forventer vi et objekt: { data: [...], hysteresis: 40 }
        // Hvis jsonResponse er et array (fra det gamle script), falder vi tilbage til at håndtere det
        const isArray = Array.isArray(jsonResponse);
        const sheetData = isArray ? jsonResponse : jsonResponse.data;
        const fetchedHysteresis = isArray ? 40 : (jsonResponse.hysteresis || 40);
        
        if (sheetData && sheetData.length > 0) {
          // Keep only the last 24 entries for the chart
          const recentData = sheetData.slice(-24);
          setData(recentData);
          setCurrentMoisture(recentData[recentData.length - 1].value);
          setSavedHysteresis(fetchedHysteresis);
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
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const handleSaveSettings = async (newHysteresis) => {
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hysteresis: newHysteresis }),
      });
      if (!res.ok) throw new Error('Failed to save settings');
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Der opstod en fejl ved forsøg på at gemme indstillingerne.");
    }
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

      <SettingsPanel currentHysteresis={savedHysteresis} onSave={handleSaveSettings} />
    </main>
  );
}
