import { create } from "zustand";

const useFileTreeStore = create((set) => ({
  selectedFile: "project/src/index.html",

  openFolders: {
    project: true,
    "project/public": false,
    "project/src": true,
    "project/src/styles": true,
    "project/src/scripts": true,
  },

  setSelectedFile: (filePath) => set({ selectedFile: filePath }),

  toggleFolder: (path) =>
    set((state) => ({
      openFolders: {
        ...state.openFolders,
        [path]: !state.openFolders[path],
      },
    })),
}));

export default useFileTreeStore;