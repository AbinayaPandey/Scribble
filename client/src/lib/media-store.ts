import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface MediaStore {
  sharedFile: {
    dataUrl: string;
    name: string;
    type: string;
  } | null;
  setSharedFile: (file: { dataUrl: string; name: string; type: string } | null) => void;
  clearSharedFile: () => void;
}

export const useMediaStore = create<MediaStore>()(
  persist(
    (set) => ({
      sharedFile: null,
      setSharedFile: (file) => set({ sharedFile: file }),
      clearSharedFile: () => set({ sharedFile: null }),
    }),
    {
      name: "media-storage", // unique name for the storage
      storage: createJSONStorage(() => localStorage), // use localStorage to persist across refreshes
    }
  )
);
