/**
 * Oberer Kopfbereich der App.
 * Zeigt den Seitentitel dezent an.
 */
export default function Header({ title, selectedLineup, user, onLogout }) {
  return (
    <header className="app-header">
      <div className="app-header-left">
        <h1 className="page-title">{title}</h1>
      </div>
    </header>
  );
}