import { View, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStoredUser } from "../../utils/auth";

// ✅ DEV CONTROL SWITCHES
const FORCE_LOGIN = true;
const FORCE_ONBOARDING = true; // 👈 TEMP: set true to always show onboarding

export default function LoadingScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 🚧 DEV: FORCE ONBOARDING (highest priority)
        if (FORCE_ONBOARDING) {
          navigation.replace("Onboarding");
          return;
        }

        // ✅ 1. CHECK ONBOARDING FIRST
        const hasSeen = await AsyncStorage.getItem("hasSeenOnboarding");

        if (hasSeen !== "true") {
          navigation.replace("Onboarding");
          return;
        }

        // 🚧 DEV: FORCE LOGIN (after onboarding)
        if (FORCE_LOGIN) {
          navigation.replace("Login");
          return;
        }

        // ✅ 2. NORMAL AUTH FLOW
        const user = await getStoredUser();

        if (!user) {
          navigation.replace("Login");
          return;
        }

        // ✅ 3. ROLE ROUTING
        if (user.role === "admin") {
          navigation.replace("Admin");
        } else if (user.role === "technician") {
          navigation.replace("Technician");
        } else if (user.role === "customer") {
          navigation.replace("Customer");
        } else {
          navigation.replace("Login");
        }
      } catch (e) {
        navigation.replace("Login");
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
