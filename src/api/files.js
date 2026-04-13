import api from "./axios";

export const getFileTree = (userId) => {
  return api.get("/files/tree", {
    params: { userId },
  });
};

export const createFileOrFolder = ({ parentPath, name, type }) => {
  return api.post("/files/create", {
    parentPath,
    name,
    type,
  });
};

export const saveFile = ({ filePath, content }) => {
  return api.post("/files/save", {
    filePath,
    content,
  });
};

export const executeFile = ({ filePath, language }) => {
  return api.post("/files/execute", {
    filePath,
    language,
  });
};