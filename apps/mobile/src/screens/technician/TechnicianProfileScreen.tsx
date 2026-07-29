import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  ImageBackground,
  Linking,
  Image,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { useEffect, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";

export default function TechnicianProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [profileRes, dashboardRes] = await Promise.all([
        api.get("/users/me"),
        api.get("/technicians/dashboard"),
      ]);
      setProfile(profileRes.data);
      setStats(dashboardRes.data);
      animateIn();
    } catch (err: any) {
      console.log(err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.log("Logout:", err);
    }
    await AsyncStorage.removeItem("token");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const callAdmin = async () => {
    const phoneNumber = "tel:+918095994004";
    const supported = await Linking.canOpenURL(phoneNumber);
    if (supported) {
      await Linking.openURL(phoneNumber);
    } else {
      alert("Calling is not supported on this device.");
    }
  };

  const initials =
    profile?.name
      ?.split(" ")
      ?.map((item: string) => item[0])
      ?.join("")
      ?.toUpperCase() || "T";

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.bgGradient}>
          <View style={[styles.bgOrb, styles.bgOrb1]} />
          <View style={[styles.bgOrb, styles.bgOrb2]} />
        </View>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const statItems = [
    {
      icon: "time-outline",
      label: "Pending",
      value: stats?.pendingJobs ?? 0,
      color: "#fbbf24",
      bg: "rgba(146, 64, 14, 0.3)",
    },
    {
      icon: "construct-outline",
      label: "Active",
      value: stats?.activeJobs ?? 0,
      color: "#60a5fa",
      bg: "rgba(30, 58, 95, 0.3)",
    },
    {
      icon: "checkmark-circle-outline",
      label: "Completed",
      value: stats?.completedJobs ?? 0,
      color: "#34d399",
      bg: "rgba(6, 78, 59, 0.3)",
    },
    {
      icon: "document-text-outline",
      label: "Reports",
      value: stats?.reportsSubmitted ?? 0,
      color: "#a78bfa",
      bg: "rgba(76, 29, 149, 0.3)",
    },
  ];

  const menuSections = [
    {
      title: "Account",
      items: [
        {
          icon: "person-circle-outline",
          color: "#a78bfa",
          label: "Personal Information",
          sub: "View your account details",
          route: "TechnicianPersonalInfo",
        },
      ],
    },
    {
      title: "Work",
      items: [
        {
          icon: "briefcase-outline",
          color: "#60a5fa",
          label: "My Assignments",
          sub: "View assigned service jobs",
          route: "Jobs",
        },
        {
          icon: "document-outline",
          color: "#34d399",
          label: "Submitted Reports",
          sub: "Browse completed reports",
          route: "Completed",
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: "call-outline",
          color: "#22d3ee",
          label: "Contact Admin",
          sub: "+91 80959 94004",
          action: callAdmin,
        },
        {
          icon: "help-circle-outline",
          color: "#f472b6",
          label: "Help Center",
          sub: "Call support for assistance",
          action: callAdmin,
        },
      ],
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/images/jobscreen.png")}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(2,6,23,0.78)" },
          ]}
        />
      </ImageBackground>

      {/* Gradient Orbs */}
      <View style={styles.bgGradient}>
        <View style={[styles.bgOrb, styles.bgOrb1]} />
        <View style={[styles.bgOrb, styles.bgOrb2]} />
        <View style={[styles.bgOrb, styles.bgOrb3]} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8b5cf6"
          />
        }
      >
        {/* Hero Card */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          <View style={styles.heroCard}>
            <View style={styles.avatarGlow} />
            {profile?.profileImage ? (
              <Image
                source={{
                  uri: `${api.defaults.baseURL}/uploads/users/${profile.profileImage}`,
                }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <Text style={styles.name}>{profile?.name}</Text>
            <Text style={styles.role}>Hydraulic Technician</Text>
            <Text style={styles.email}>{profile?.email}</Text>

            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Available for Service</Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <View style={styles.statsGrid}>
            {statItems.map((stat, index) => (
              <View
                key={index}
                style={[styles.statCard, { borderColor: `${stat.color}40` }]}
              >
                <View
                  style={[styles.statIconWrap, { backgroundColor: stat.bg }]}
                >
                  <Ionicons
                    name={stat.icon as any}
                    color={stat.color}
                    size={22}
                  />
                </View>
                <Text style={[styles.statNumber, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Menu Sections */}
        {menuSections.map((section, sIndex) => (
          <Animated.View
            key={sIndex}
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionLine,
                  {
                    backgroundColor:
                      section.title === "Account"
                        ? "#a78bfa"
                        : section.title === "Work"
                          ? "#60a5fa"
                          : "#f472b6",
                  },
                ]}
              />
              <Text style={styles.sectionHeading}>{section.title}</Text>
            </View>
            <View style={styles.sectionCard}>
              {section.items.map((item, iIndex) => (
                <Pressable
                  key={iIndex}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && { backgroundColor: "rgba(255,255,255,0.03)" },
                    iIndex < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() =>
                    item.action
                      ? item.action()
                      : navigation.navigate(item.route)
                  }
                >
                  <View
                    style={[
                      styles.menuIconWrap,
                      { backgroundColor: `${item.color}15` },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={item.color}
                    />
                  </View>
                  <View style={styles.menuTextWrap}>
                    <Text style={styles.menuText}>{item.label}</Text>
                    <Text style={styles.menuSubText}>{item.sub}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#4b5563" />
                </Pressable>
              ))}
            </View>
          </Animated.View>
        ))}

        {/* Logout */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            onPress={() => setShowLogoutModal(true)}
          >
            <View style={styles.logoutIconWrap}>
              <Ionicons name="log-out-outline" size={20} color="#f87171" />
            </View>
            <Text style={styles.logoutText}>Logout</Text>
            <Ionicons name="chevron-forward" size={18} color="#f87171" />
          </Pressable>
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>

      <ConfirmationModal
        visible={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout of your account?"
        confirmText="Logout"
        cancelText="Stay Logged In"
        confirmColor="#ef4444"
        icon="log-out-outline"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={async () => {
          setShowLogoutModal(false);
          await logout();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 50 },

  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    pointerEvents: "none",
  },
  bgOrb: { position: "absolute", borderRadius: 999, opacity: 0.08 },
  bgOrb1: {
    width: 400,
    height: 400,
    backgroundColor: "#7c3aed",
    top: -150,
    right: -100,
  },
  bgOrb2: {
    width: 300,
    height: 300,
    backgroundColor: "#2563eb",
    top: 200,
    left: -100,
  },
  bgOrb3: {
    width: 250,
    height: 250,
    backgroundColor: "#ec4899",
    bottom: 100,
    right: -50,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  loadingText: {
    color: "#6b7280",
    marginTop: 14,
    fontSize: 14,
    fontWeight: "500",
  },

  // Hero
  heroCard: {
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  avatarGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#7c3aed",
    opacity: 0.15,
    top: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#7c3aed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 3,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "800" },
  name: { color: "#fff", fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  role: { color: "#a78bfa", marginTop: 6, fontSize: 15, fontWeight: "600" },
  email: { color: "#6b7280", marginTop: 6, fontSize: 13, letterSpacing: 0.2 },
  onlineBadge: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(6, 78, 59, 0.4)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34d399",
    marginRight: 8,
  },
  onlineText: { color: "#34d399", fontWeight: "700", fontSize: 12 },

  // Stats
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 28,
    gap: 10,
  },
  statCard: {
    width: "47%",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statNumber: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  statLabel: {
    color: "#6b7280",
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Sections
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionLine: { width: 4, height: 18, borderRadius: 2, marginRight: 10 },
  sectionHeading: {
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  sectionCard: {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.6)",
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },

  menuItem: { flexDirection: "row", alignItems: "center", padding: 16 },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(30, 41, 59, 0.4)",
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuTextWrap: { flex: 1 },
  menuText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  menuSubText: { color: "#6b7280", fontSize: 12, marginTop: 3 },

  // Logout
  logoutButton: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(127, 29, 29, 0.3)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  logoutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  logoutText: {
    flex: 1,
    color: "#f87171",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
