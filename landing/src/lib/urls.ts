const FRONTEND_URL = (
  process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

export function frontendUrl(path = "") {
  return `${FRONTEND_URL}${path}`;
}
