import { useState } from "react";

/**
 * Wiederverwendbarer Klappbereich.
 * Die Komponente zeigt einen Titelbereich mit Button an und blendet den Inhalt je nach Zustand ein oder aus.
 */
export default function CollapsiblePanel({ title, description, defaultOpen = true, className = "", children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  /**
   * Schaltet den sichtbaren Bereich um.
   * Wird genutzt, um Seitenbereiche auf dem Tablet schneller ein- und auszublenden.
   */
  function togglePanel() {
    setIsOpen((currentState) => !currentState);
  }

  return (
    <section className={`panel collapsible-panel ${className}`}>
      <div className="section-title collapsible-header">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>

        <button type="button" className="collapse-button" onClick={togglePanel}>
          {isOpen ? "Einklappen" : "Ausklappen"}
        </button>
      </div>

      {isOpen && <div className="collapsible-content">{children}</div>}
    </section>
  );
}
