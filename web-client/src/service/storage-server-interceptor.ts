import axios from "axios";

export const storageInstance = axios.create({
  baseURL: "https://luidium-storage-api.lighterlinks.io",
  headers: {},
});
