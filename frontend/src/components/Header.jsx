/**
 * Oberer Kopfbereich der App.
 * Zeigt Produktnamen, aktuelle Aufstellung und Gegner an.
 */
export default function Header({ selectedLineup, user, onLogout }) {
  return (
    <header className="app-header">
      <div className="app-header-left">
        <p className="eyebrow">Matchday Coaching App</p>
        <h1>Aufstellung & Coaching</h1>
      </div>
    </header>
  );
}