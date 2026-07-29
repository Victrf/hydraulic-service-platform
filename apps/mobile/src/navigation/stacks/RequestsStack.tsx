import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MyRequestsScreen from "../../screens/customer/MyRequestsScreen";
import ReportScreen from "../../screens/customer/ReportScreen";

const Stack = createNativeStackNavigator();

export default function RequestsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RequestsHome" component={MyRequestsScreen} />

      <Stack.Screen name="Report" component={ReportScreen} />
    </Stack.Navigator>
  );
}
