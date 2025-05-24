import { createContext, useEffect, useState } from "react";
import socketService from "../services/socketService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));

          // reconnect to socket server
          if (!socketService.connected) {
            console.log("Reconnecting to socket server...");
            await socketService.reconnect();
          }
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const login = async (userData) => {
    setUser(userData);

    // store user data in local storage
    localStorage.setItem("user", JSON.stringify(userData));

    // connect socket with user data
    await socketService.connect(
      import.meta.env.VITE_BACKEND_HTTP,
      userData.username,
      userData.password
    );
  };

  const logout = () => {
    setUser(null);

    // remove user data from local storage
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
