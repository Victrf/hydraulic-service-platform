import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import CustomerHomeScreen from "../screens/customer/CustomerHomeScreen";
import CreateRequestScreen from "../screens/customer/CreateRequestScreen";
import MyRequestsScreen from "../screens/customer/MyRequestsScreen";

// TEMP
function UpdateScreen() {
  return <Text style={{ color: "#fff" }}>Update Screen</Text>;
}

const Tab = createBottomTabNavigator();

export default function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "#0f172a",
          borderTopColor: "#1f2937",
          height: 65,
        },

        tabBarActiveTintColor: "#7c3aed",
        tabBarInactiveTintColor: "#9ca3af",

        tabBarIcon: ({ color, size, focused }) => {
          let iconName: any = "home";

          if (route.name === "Home") iconName = "home";
          if (route.name === "Profile") iconName = "person-add";
          if (route.name === "Requests") iconName = "document-text";

          return (
            <Ionicons
              name={iconName}
              size={focused ? size + 2 : size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={CustomerHomeScreen} />
      <Tab.Screen name="Profile" component={CreateRequestScreen} />
      <Tab.Screen name="Requests" component={MyRequestsScreen} />
    </Tab.Navigator>
  );
}
