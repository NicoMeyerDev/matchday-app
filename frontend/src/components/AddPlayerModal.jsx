import { useState } from "react";
import { createPlayer } from "../api/client";

export default function AddPlayerModal({ onClose, onPlayerCreated }) {
  const [name, setName] = useState("");
  const [shirtNumber, setShirtNumber] = useState("");
  const [position, setPosition] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    if (!name || !position) {
      setError("Name und Position sind Pflichtfelder.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      const newPlayer = await createPlayer({
        name,
        shirt_number: shirtNumber ? parseInt(shirtNumber) : null,
        preferred_positions: position,
        is_active: true,
      });
      onPlayerCreated(newPlayer);
      onClose();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Spieler hinzufügen</h2>
          <button type="button" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="field">
          <label>Name *</label>
          <input
            type="text"
            placeholder="Max Mustermann"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Trikotnummer</label>
            <input
              type="number"
              placeholder="10"
              value={shirtNumber}
              onChange={(e) => setShirtNumber(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Position *</label>
            <select value={position} onChange={(e) => setPosition(e.target.value)}>
              <option value="">Wählen...</option>
              <option value="TW">TW – Torwart</option>
              <option value="IV">IV – Innenverteidiger</option>
              <option value="LV">LV – Linksverteidiger</option>
              <option value="RV">RV – Rechtsverteidiger</option>
              <option value="DM">DM – Defensives Mittelfeld</option>
              <option value="ZM">ZM – Zentrales Mittelfeld</option>
              <option value="OM">OM – Offensives Mittelfeld</option>
              <option value="LA">LA – Linksaußen</option>
              <option value="RA">RA – Rechtsaußen</option>
              <option value="ST">ST – Stürmer</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="ghost-button" onClick={onClose}>
            Abbrechen
          </button>
          <button type="button" className="primary-button" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Wird gespeichert..." : "Spieler speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}