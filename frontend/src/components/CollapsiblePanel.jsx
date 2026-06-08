import { useState } from "react";

/**
 * Wiederverwendbarer Klappbereich.
 * Die Komponente nutzt bewusst nur einen Pfeil als Schalter, damit die Oberfläche ruhiger wirkt.
 */
export default function CollapsiblePanel({ title, description, defaultOpen = true, className = "", children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  /**
   * Schaltet den sichtbaren Bereich ein oder aus.
   * Der Zustand bleibt lokal in der Komponente, weil hierfür kein Backend nötig ist.
   */
  function togglePanel() {
    setIsOpen((currentState) => !currentState);
  }

  return (
    <section className={`panel collapsible-panel ${className} ${isOpen ? "is-open" : "is-closed"}`}>
      <div className="section-title collapsible-header">
        <div>
          <h2>{title}</h2>
          {description && isOpen && <p>{description}</p>}
        </div>

        <button
          type="button"
          className="icon-collapse-button"
          onClick={togglePanel}
          aria-label={isOpen ? `${title} einklappen` : `${title} ausklappen`}
          title={isOpen ? "Einklappen" : "Ausklappen"}
        >
          {isOpen ? "⌄" : "›"}
        </button>
      </div>

      {isOpen && <div className="collapsible-content">{children}</div>}
    </section>
  );
}
