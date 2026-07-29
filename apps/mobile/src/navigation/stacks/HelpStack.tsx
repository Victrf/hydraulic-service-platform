import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HelpScreen from "../../screens/customer/HelpScreen";

const Stack = createNativeStackNavigator();

export default function HelpStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HelpHome" component={HelpScreen} />
    </Stack.Navigator>
  );
}
