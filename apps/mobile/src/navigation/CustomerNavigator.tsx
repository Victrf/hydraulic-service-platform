import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CustomerTabs from "./CustomerTabs";

import CreateRequestScreen from "../screens/customer/CreateRequestScreen";
import CreateEquipmentRequestScreen from "../screens/customer/CreateEquipmentRequestScreen";
import ReportScreen from "../screens/customer/ReportScreen";
import ProductDetailScreen from "../screens/customer/ProductDetailScreen";
import CustomerRequestDetailsScreen from "../screens/customer/CustomerRequestDetailsScreen";

const Stack = createNativeStackNavigator();

export default function CustomerNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="CustomerTabs"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="CustomerTabs" component={CustomerTabs} />

      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />

      <Stack.Screen
        name="CreateEquipmentRequest"
        component={CreateEquipmentRequestScreen}
      />
      <Stack.Screen
        name="CustomerRequestDetails"
        component={CustomerRequestDetailsScreen}
      />

      <Stack.Screen name="Report" component={ReportScreen} />

      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}
