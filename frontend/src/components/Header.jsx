/**
 * Oberer Kopfbereich der App.
 * Zeigt Produktnamen, aktuelle Aufstellung und Gegner an.
 */
export default function Header({ selectedLineup }) {
  return (
    <header className="app-header">
      <div className="app-header-left">
        <p className="eyebrow">Matchday Coaching App</p>
        <h1>Aufstellung & Coaching</h1>
      </div>
      <div className="match-card">
        <span>Aktuelles Spiel</span>
        <strong>{selectedLineup?.title || "Neue Aufstellung"}</strong>
        <small>{selectedLineup?.opponent || "Gegner offen"}</small>
      </div>
    </header>
  );
}
