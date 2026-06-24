import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function EntryScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const seen = await AsyncStorage.getItem("hasSeenOnboarding");

      if (seen === "true") {
        navigation.replace("Login");
      } else {
        navigation.replace("Onboarding");
      }

      setLoading(false);
    };

    check();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
