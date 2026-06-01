"use client";

// MOCK: Updated with Agent's data (Maria Sanchez)
export function useAuth() {
  return {
    // According to token: naomichiquito06@gmail.com (ID 12 - Agente)
    role: 2, 
    user: {
      id: 12,
      name: "Maria Sanchez",
      email: "naomichiquito06@gmail.com",
    },
    isAuthenticated: true,
  };
}
