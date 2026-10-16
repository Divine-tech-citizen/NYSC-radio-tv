import { createApiClient } from "@nysc/shared";
import { auth } from "./firebase";

export const api = createApiClient(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5078",
  async () => (auth?.currentUser ? auth.currentUser.getIdToken() : null)
);
