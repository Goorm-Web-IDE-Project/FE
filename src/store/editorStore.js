import { create } from "zustand";

const useEditorStore = create((set) => ({
  htmlCode: "",
  cssCode: "",
  jsCode: "",

  setHtmlCode: (value) => set({ htmlCode: value }),
  setCssCode: (value) => set({ cssCode: value }),
  setJsCode: (value) => set({ jsCode: value }),
}));

export default useEditorStore;