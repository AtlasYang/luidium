import { ChatRequest, ChatUnit } from "./interface";
import axios from "axios";

export async function getChatResponse(request: ChatRequest) {
  const instance = axios.create({
    baseURL: "https://api.lighterlinks.io/ollama/chat",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = JSON.stringify(request);

  try {
    const response = await instance.post("/", data);
    return response.data as ChatUnit;
  } catch (error) {
    console.error(error);
  }
}
