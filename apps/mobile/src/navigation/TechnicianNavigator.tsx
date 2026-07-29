import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TechnicianTabs from "./TechnicianTabs";

import JobDetailsScreen from "../screens/technician/JobDetailsScreen";
import SubmitReportScreen from "../screens/technician/SubmitReportScreen";
import TechnicianReportScreen from "../screens/technician/TechnicianReportScreen";
import TechnicianPersonalInfoScreen from "../screens/technician/TechnicianPersonalInfoScreen";
import TechnicianProfileScreen from "../screens/technician/TechnicianProfileScreen";
import ScheduledMaintenanceScreen from "../screens/technician/ScheduledMaintenanceScreen";
import MaintenanceVisitDetailScreen from "../screens/technician/MaintenanceVisitDetailScreen";
import MaintenanceFindingsScreen from "../screens/technician/MaintenanceFindingsScreen";
import CreateMaintenanceFindingScreen from "../screens/technician/CreateMaintenanceFindingScreen";
import EditMaintenanceFindingScreen from "../screens/technician/EditMaintenanceFindingScreen";
import MaintenanceFindingPhotosScreen from "../screens/technician/MaintenanceFindingPhotosScreen";

const Stack = createNativeStackNavigator();

export default function TechnicianNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="TechnicianTabs"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="TechnicianTabs" component={TechnicianTabs} />

      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />

      <Stack.Screen name="SubmitReport" component={SubmitReportScreen} />
      <Stack.Screen
        name="TechnicianReport"
        component={TechnicianReportScreen}
      />
      <Stack.Screen
        name="TechnicianPersonalInfo"
        component={TechnicianPersonalInfoScreen}
      />
      <Stack.Screen
        name="ScheduledMaintenance"
        component={ScheduledMaintenanceScreen}
      />

      <Stack.Screen
        name="MaintenanceFindings"
        component={MaintenanceFindingsScreen}
      />

      <Stack.Screen
        name="MaintenanceVisitDetails"
        component={MaintenanceVisitDetailScreen}
      />
      <Stack.Screen
        name="CreateMaintenanceFinding"
        component={CreateMaintenanceFindingScreen}
      />
      <Stack.Screen
        name="MaintenanceFindingPhotos"
        component={MaintenanceFindingPhotosScreen}
      />
      <Stack.Screen
        name="EditMaintenanceFinding"
        component={EditMaintenanceFindingScreen}
      />

      <Stack.Screen
        name="TechnicianProfile"
        component={TechnicianProfileScreen}
      />
    </Stack.Navigator>
  );
}
