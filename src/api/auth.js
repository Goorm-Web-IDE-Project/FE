import api from "./axios";

export const loginRequest = ({ userId, password, name }) => {
  return api.post("/auth/login", {
    userId,
    password,
    name,
  });
};

export const signupRequest = ({ userId, password, name }) => {
  return api.post("/auth/signup", {
    userId,
    password,
    name,
  });
};