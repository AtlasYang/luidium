import axios from "axios";
import { User } from "../user/interface";
import { mainInstance } from "../main-server-interceptor";

const authInstance = axios.create({
  baseURL: "https://luidium-main-api.lighterlinks.io/auth",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export async function register({
  name,
  email,
  password,
  imageUrl,
}: {
  name: string;
  email: string;
  password: string;
  imageUrl: string;
}) {
  const result = await authInstance.post("/register", {
    email,
    password,
    name,
    image_url: imageUrl,
  });
  return result.status === 200;
}

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const result = await authInstance.post("/login", {
      email,
      password,
    });

    if (result.status === 200) {
      return true;
    }

    return false;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export async function logout() {
  const result = await authInstance.get("/logout");
  return result.status === 200;
}

export async function validate() {
  const result = await authInstance.get("/validate");
  return result.data as {
    content: string;
  };
}

export async function getUserInfo(userId: string) {
  const result = await authInstance.get("/user/" + userId);
  return result.data as User;
}

export async function checkEmailDuplicate(email: string) {
  const result = await authInstance.get(`/check/${email}`);
  if (result.status !== 200) {
    return false;
  }
  return result.data.success;
}
