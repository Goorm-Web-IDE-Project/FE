import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      currentUser: {
        id: "user-me",
        name: "나",
      },

      login: (displayName) =>
        set({
          isLoggedIn: true,
          currentUser: {
            id: "user-me",
            name: displayName,
          },
        }),

      logout: () =>
        set({
          isLoggedIn: false,
          currentUser: {
            id: "user-me",
            name: "나",
          },
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useAuthStore;