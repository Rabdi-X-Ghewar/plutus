export interface Message {
  type: "user" | "agent" | "system";
  content: string;
  timestamp: Date;
}