import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import TechnicianDashboard from "../screens/technician/TechnicianDashboard";
import JobsScreen from "../screens/technician/JobsScreen";
import CompletedJobsScreen from "../screens/technician/CompletedJobsScreen";
import TechnicianProfileScreen from "../screens/technician/TechnicianProfileScreen";

const Tab = createBottomTabNavigator();

export default function TechnicianTabs() {
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

          switch (route.name) {
            case "Home":
              iconName = "Dashboard";
              break;

            case "Jobs":
              iconName = "construct";
              break;

            case "Completed":
              iconName = "checkmark-circle";
              break;

            case "Profile":
              iconName = "person";
              break;
          }

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
      <Tab.Screen name="Dashboard" component={TechnicianDashboard} />

      <Tab.Screen name="Jobs" component={JobsScreen} />

      <Tab.Screen name="Completed" component={CompletedJobsScreen} />

      <Tab.Screen name="Profile" component={TechnicianProfileScreen} />
    </Tab.Navigator>
  );
}
