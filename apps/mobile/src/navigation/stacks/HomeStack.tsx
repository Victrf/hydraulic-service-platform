import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CustomerHomeScreen from "../../screens/customer/CustomerHomeScreen";
import ProductDetailScreen from "../../screens/customer/ProductDetailScreen";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={CustomerHomeScreen} />

      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}
