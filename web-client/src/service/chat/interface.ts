export interface ChatUnit {
  role: string;
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatUnit[];
  stream: boolean;
  keep_alive: number;
}
