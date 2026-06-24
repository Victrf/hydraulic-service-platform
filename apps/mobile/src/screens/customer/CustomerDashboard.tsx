import { View, Text, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function CustomerDashboard() {
  const navigation = useNavigation<any>();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>Customer Dashboard</Text>

      <Button
        title="Create Service Request"
        onPress={() => navigation.navigate("CreateRequest")}
      />

      <View style={{ marginTop: 15 }} />

      <Button
        title="My Requests"
        onPress={() => navigation.navigate("MyRequests")}
      />
    </View>
  );
}
