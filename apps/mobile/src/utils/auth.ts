import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  sub: string;
  role: string;
}

export async function getStoredUser() {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    return null;
  }

  const decoded = jwtDecode<TokenPayload>(token);

  return {
    token,
    role: decoded.role,
  };
}
