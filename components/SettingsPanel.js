"use client";

import { useState, useEffect } from "react";

export default function SettingsPanel({ currentHysteresis, onSave }) {
  const [hysteresis, setHysteresis] = useState(currentHysteresis || 40);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (currentHysteresis !== undefined) {
      setHysteresis(currentHysteresis);
    }
  }, [currentHysteresis]);

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMsg("");
    // Simulate API call to save to Google Sheets
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (onSave) {
      await onSave(hysteresis);
    }
    
    setIsSaving(false);
    setSuccessMsg("Settings saved to Google Sheets!");
    
    setTimeout(() => {
      setSuccessMsg("");
    }, 3000);
  };

  return (
    <div className="glass-panel" style={{ marginTop: "24px" }}>
      <h2 style={{ marginBottom: "16px", fontSize: "1.5rem" }}>Pump Control Settings</h2>
      <p style={{ color: "#8b949e", marginBottom: "24px", fontSize: "0.95rem" }}>
        Adjust the moisture threshold (hysteresis). The ESP32 will read this value from the database and water the plant when the moisture drops below this percentage.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
        <div>
          <label className="label" htmlFor="hysteresis">Moisture Threshold (%)</label>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <input
              type="range"
              id="hysteresis"
              min="10"
              max="90"
              value={hysteresis}
              onChange={(e) => setHysteresis(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: "var(--primary-green)" }}
            />
            <span style={{ fontWeight: "bold", minWidth: "40px" }}>{hysteresis}%</span>
          </div>
        </div>

        <button 
          className="btn-primary" 
          onClick={handleSave} 
          disabled={isSaving}
          style={{ alignSelf: "flex-start", marginTop: "8px" }}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>

        {successMsg && (
          <div style={{ color: "var(--primary-green)", fontSize: "0.9rem", marginTop: "8px" }}>
            ✓ {successMsg}
          </div>
        )}
      </div>
    </div>
  );
}
