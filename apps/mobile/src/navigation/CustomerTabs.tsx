import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import CustomerHomeScreen from "../screens/customer/CustomerHomeScreen";
import MyRequestsScreen from "../screens/customer/MyRequestsScreen";
import HelpScreen from "../screens/customer/HelpScreen";
import MySubscriptionScreen from "../screens/customer/MySubscriptionScreen";

import ProfileScreen from "../screens/customer/ProfileScreen";

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
          if (route.name === "Subscription") iconName = "card";
          if (route.name === "Help") iconName = "help-circle";

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

      <Tab.Screen name="Requests" component={MyRequestsScreen} />

      <Tab.Screen name="Profile" component={ProfileScreen} />

      <Tab.Screen name="Subscription" component={MySubscriptionScreen} />

      <Tab.Screen name="Help" component={HelpScreen} />
    </Tab.Navigator>
  );
}
