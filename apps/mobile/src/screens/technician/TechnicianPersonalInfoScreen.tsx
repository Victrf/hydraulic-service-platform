import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";

const { width } = Dimensions.get("window");

export default function TechnicianPersonalInfoScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      const res = await api.get("/users/me");
      setProfile(res.data);
      animateIn();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const initials =
    profile?.name
      ?.split(" ")
      ?.map((item: string) => item[0])
      ?.join("")
      ?.toUpperCase() || "T";

  const infoItems = [
    {
      icon: "person-outline",
      label: "Full Name",
      value: profile?.name,
      color: "#a78bfa",
    },
    {
      icon: "mail-outline",
      label: "Email Address",
      value: profile?.email,
      color: "#60a5fa",
    },
    {
      icon: "shield-checkmark-outline",
      label: "Role",
      value: profile?.role,
      color: "#34d399",
    },
    {
      icon: "business-outline",
      label: "Company",
      value: profile?.company?.name || "-",
      color: "#fbbf24",
    },
    {
      icon: "call-outline",
      label: "Phone Number",
      value: profile?.phone || "-",
      color: "#f472b6",
    },
  ];

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

  return (
    <View style={styles.screen}>
      {/* Background Orbs */}
      <View style={styles.bgGradient}>
        <View style={[styles.bgOrb, styles.bgOrb1]} />
        <View style={[styles.bgOrb, styles.bgOrb2]} />
        <View style={[styles.bgOrb, styles.bgOrb3]} />
      </View>

      <ScrollView
        style={styles.scroll}
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
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.title}>Personal Information</Text>
          <Text style={styles.subtitle}>Your technician account details</Text>
        </Animated.View>

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

        {/* Info Cards */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <View
                style={[styles.sectionLine, { backgroundColor: "#a78bfa" }]}
              />
              <Text style={styles.sectionTitle}>Account Details</Text>
            </View>

            <View style={styles.infoCard}>
              {infoItems.map((item, index) => (
                <View
                  key={item.label}
                  style={[
                    styles.infoRow,
                    index < infoItems.length - 1 && styles.infoRowBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.infoIconWrap,
                      { backgroundColor: `${item.color}15` },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={18}
                      color={item.color}
                    />
                  </View>
                  <View style={styles.infoTextWrap}>
                    <Text style={styles.infoLabel}>{item.label}</Text>
                    <Text style={styles.infoValue}>{item.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Security Note */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <View style={styles.securityCard}>
            <Ionicons name="lock-closed-outline" size={18} color="#6b7280" />
            <Text style={styles.securityText}>
              Your information is securely stored and encrypted.
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  scroll: { flex: 1 },
  bgGradient: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  bgOrb: { position: "absolute", borderRadius: 999, opacity: 0.1 },
  bgOrb1: {
    width: 350,
    height: 350,
    backgroundColor: "#7c3aed",
    top: -100,
    right: -80,
  },
  bgOrb2: {
    width: 280,
    height: 280,
    backgroundColor: "#2563eb",
    top: 200,
    left: -100,
  },
  bgOrb3: {
    width: 200,
    height: 200,
    backgroundColor: "#ec4899",
    bottom: 100,
    right: -50,
    opacity: 0.08,
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

  content: { padding: 20, paddingTop: 60, paddingBottom: 20 },

  // Header
  header: { marginBottom: 24 },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 0.2,
  },

  // Profile Card
  profileCard: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
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
    opacity: 0.12,
    top: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#7c3aed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  profileName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  profileRole: {
    color: "#a78bfa",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
    textTransform: "capitalize",
  },
  profileBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  profileBadgeText: { color: "#34d399", fontSize: 12, fontWeight: "700" },

  // Info Section
  infoSection: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionLine: { width: 4, height: 18, borderRadius: 2, marginRight: 10 },
  sectionTitle: {
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  infoCard: {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.6)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  infoRow: { flexDirection: "row", alignItems: "center", padding: 16 },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(30, 41, 59, 0.4)",
  },
  infoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  infoTextWrap: { flex: 1 },
  infoLabel: {
    color: "#6b7280",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },

  // Security
  securityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.4)",
  },
  securityText: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
    lineHeight: 18,
  },
});
