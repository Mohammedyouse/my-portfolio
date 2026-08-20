import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import Loading from "../components/Loading";

interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
  setLoading: (percent: number) => void;
}

export const LoadingContext = createContext<LoadingType | null>(null);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(() => {
    // The 3D character is only mounted on wide desktop screens.
    return window.innerWidth > 1024;
  });
  const [loading, setLoading] = useState(0);

  const value = {
    isLoading,
    setIsLoading,
    setLoading,
  };
  useEffect(() => {
    const isWideDesktop = window.innerWidth > 1024;
    let startupTimeout: ReturnType<typeof setTimeout> | undefined;

    if (!isWideDesktop) {
      import("../components/utils/initialFX").then((module) => {
        startupTimeout = setTimeout(() => {
          if (document.querySelector(".landing-section")) {
            module.initialFX?.();
          }
        }, 100);
      });
      return () => {
        if (startupTimeout) clearTimeout(startupTimeout);
      };
    }

    // A failed or unexpectedly slow optional 3D asset must not block startup.
    startupTimeout = setTimeout(() => setLoading(100), 12000);
    return () => clearTimeout(startupTimeout);
  }, []);

  return (
    <LoadingContext.Provider value={value as LoadingType}>
      {isLoading && <Loading percent={loading} />}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
