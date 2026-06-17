import { createContext, useContext, useState } from "react";

interface SosContextType {
  sosActive: boolean;       // banner on home page
  overlayActive: boolean;   // full-screen emergency overlay
  activateSos: () => void;
  dismissSos: () => void;
  dismissOverlay: () => void; // close overlay, keep banner
}

const SosContext = createContext<SosContextType>({
  sosActive: false,
  overlayActive: false,
  activateSos: () => {},
  dismissSos: () => {},
  dismissOverlay: () => {},
});

export function SosProvider({ children }: { children: React.ReactNode }) {
  const [sosActive, setSosActive] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);
  return (
    <SosContext.Provider
      value={{
        sosActive,
        overlayActive,
        activateSos: () => { setSosActive(true); setOverlayActive(true); },
        dismissSos: () => { setSosActive(false); setOverlayActive(false); },
        dismissOverlay: () => setOverlayActive(false),
      }}
    >
      {children}
    </SosContext.Provider>
  );
}

export const useSos = () => useContext(SosContext);
