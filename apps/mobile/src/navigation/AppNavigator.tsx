import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";

import LoginScreen from "../screens/auth/LoginScreen";
import AdminDashboard from "../screens/admin/AdminDashboard";
import TechnicianDashboard from "../screens/technician/TechnicianDashboard";
import LoadingScreen from "../screens/auth/LoadingScreen";

import CreateRequestScreen from "../screens/customer/CreateRequestScreen";
import RequestsScreen from "../screens/admin/RequestsScreen";
import AssignTechnicianScreen from "../screens/admin/AssignTechnicianScreen";
import RequestDetailScreen from "../screens/admin/RequestDetailScreen";
import TechnicianWorkloadScreen from "../screens/admin/TechnicianWorkloadScreen";

import JobsScreen from "../screens/technician/JobsScreen";
import SubmitReportScreen from "../screens/technician/SubmitReportScreen";

import MyRequestsScreen from "../screens/customer/MyRequestsScreen";
import ReportScreen from "../screens/customer/ReportScreen";
import ProductDetailScreen from "../screens/customer/ProductDetailScreen";

import CustomerTabs from "./CustomerTabs";
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";

import UsersScreen from "../screens/admin/UsersScreen";
import CreateUserScreen from "../screens/admin/CreateUserScreen";
import CreateCompanyScreen from "../screens/admin/CreateCompanyScreen";
import CreateEquipmentScreen from "../screens/admin/CreateEquipmentScreen";
import AssignEquipmentScreen from "../screens/admin/AssignEquipmentScreen";
import ReportsScreen from "../screens/admin/ReportsScreen";
import SubscriptionsScreen from "../screens/admin/SubscriptionsScreen";
import SubscriptionDetailScreen from "../screens/admin/SubscriptionDetailScreen";
import PaymentsScreen from "../screens/admin/PaymentsScreen";
import ProductsScreen from "../screens/admin/ProductsScreen";
import CreateProductScreen from "../screens/admin/CreateProductScreen";
import EditProductScreen from "../screens/admin/EditProductScreen";
import AnnouncementsScreen from "../screens/admin/AnnouncementsScreen";
import CreateAnnouncementScreen from "../screens/admin/CreateAnnouncementScreen";
import EditAnnouncementScreen from "../screens/admin/EditAnnouncementScreen";
import EquipmentScreen from "../screens/admin/EquipmentScreen";
import EditEquipmentScreen from "../screens/admin/EditEquipmentScreen";
import EditUserScreen from "../screens/admin/EditUserScreen";
import CompaniesScreen from "../screens/admin/CompaniesScreen";
import EditCompanyScreen from "../screens/admin/EditCompanyScreen";
import ProductDetailsScreen from "../screens/admin/ProductDetailsScreen";
import PlansScreen from "../screens/customer/PlansScreen";
import MySubscriptionScreen from "../screens/customer/MySubscriptionScreen";
import CompanyDetailsScreen from "../screens/admin/CompanyDetailsScreen";
import UserDetailsScreen from "../screens/admin/UserDetailsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Loading"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} />
        <Stack.Screen name="Admin" component={AdminDashboard} />
        <Stack.Screen name="Users" component={UsersScreen} />
        <Stack.Screen name="CreateUser" component={CreateUserScreen} />
        <Stack.Screen name="CreateCompany" component={CreateCompanyScreen} />
        <Stack.Screen name="Products" component={ProductsScreen} />
        <Stack.Screen name="CreateProduct" component={CreateProductScreen} />
        <Stack.Screen name="EditProduct" component={EditProductScreen} />
        <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
        <Stack.Screen name="Equipment" component={EquipmentScreen} />
        <Stack.Screen name="Companies" component={CompaniesScreen} />
        <Stack.Screen name="EditCompany" component={EditCompanyScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="Plans" component={PlansScreen} />
        <Stack.Screen name="MySubscription" component={MySubscriptionScreen} />
        <Stack.Screen name="EditUser" component={EditUserScreen} />
        <Stack.Screen name="EditEquipment" component={EditEquipmentScreen} />
        <Stack.Screen name="CompanyDetails" component={CompanyDetailsScreen} />
        <Stack.Screen name="UserDetails" component={UserDetailsScreen} />

        <Stack.Screen
          name="EditAnnouncement"
          component={EditAnnouncementScreen}
        />
        <Stack.Screen
          name="CreateAnnouncement"
          component={CreateAnnouncementScreen}
        />

        <Stack.Screen
          name="CreateEquipment"
          component={CreateEquipmentScreen}
        />
        <Stack.Screen
          name="SubscriptionDetail"
          component={SubscriptionDetailScreen}
        />
        {/* 🔥 NEW SCREEN */}
        <Stack.Screen
          name="AssignEquipment"
          component={AssignEquipmentScreen}
        />
        <Stack.Screen name="Requests" component={RequestsScreen} />
        <Stack.Screen
          name="AssignTechnician"
          component={AssignTechnicianScreen}
        />
        <Stack.Screen name="RequestDetail" component={RequestDetailScreen} />
        <Stack.Screen
          name="TechnicianWorkload"
          component={TechnicianWorkloadScreen}
        />
        <Stack.Screen name="Technician" component={TechnicianDashboard} />
        <Stack.Screen name="Jobs" component={JobsScreen} />
        <Stack.Screen name="SubmitReport" component={SubmitReportScreen} />
        <Stack.Screen name="Customer" component={CustomerTabs} />
        <Stack.Screen name="MyRequests" component={MyRequestsScreen} />
        <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
        <Stack.Screen name="Payments" component={PaymentsScreen} />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{
            headerShown: true,
            title: "Product Details",
            headerStyle: { backgroundColor: "#020617" },
            headerTintColor: "#fff",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
