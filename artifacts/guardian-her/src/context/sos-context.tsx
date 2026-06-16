import { createContext, useContext, useState } from "react";

interface SosContextType {
  sosActive: boolean;
  activateSos: () => void;
  dismissSos: () => void;
}

const SosContext = createContext<SosContextType>({
  sosActive: false,
  activateSos: () => {},
  dismissSos: () => {},
});

export function SosProvider({ children }: { children: React.ReactNode }) {
  const [sosActive, setSosActive] = useState(false);
  return (
    <SosContext.Provider
      value={{
        sosActive,
        activateSos: () => setSosActive(true),
        dismissSos: () => setSosActive(false),
      }}
    >
      {children}
    </SosContext.Provider>
  );
}

export const useSos = () => useContext(SosContext);
