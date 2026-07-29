import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MySubscriptionScreen from "../../screens/customer/MySubscriptionScreen";

const Stack = createNativeStackNavigator();

export default function SubscriptionStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SubscriptionHome" component={MySubscriptionScreen} />
    </Stack.Navigator>
  );
}
