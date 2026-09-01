// export const wsBaseURL = "ws://localhost:8000";

// Docker Deploy
export const wsBaseURL = "ws://localhost:8030";

// Helper function: ต่อ path ให้ถูกต้อง
export function buildWsUrl(path: string) {
  return `${wsBaseURL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
