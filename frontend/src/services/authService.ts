// services/authService.ts
import http from "./http";
import { useAuthStore } from "../store/authStore";

export const authService = {
  async login(username: string, password: string) {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    const response = await http.post("login", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data; // { access_token, token_type, user_id }
  },

  async getCurrentUser() {
    const { token, tokenType } = useAuthStore.getState();

    if (!token || !tokenType) {
      console.warn("❌ No token found in store");
      throw new Error("Missing authentication token.");
    }

    const response = await http.get("current-user", {
      headers: {
        Authorization: `${tokenType} ${token}`,
      },
    });

    return response.data;
  },
};
