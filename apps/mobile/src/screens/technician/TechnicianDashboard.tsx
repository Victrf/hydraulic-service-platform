import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  ImageBackground,
  Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";

export default function TechnicianDashboard() {
  const navigation = useNavigation<any>();

  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, []),
  );

  const loadDashboard = async () => {
    try {
      if (!dashboard) {
        setLoading(true);
      }

      const [dashboardRes, profileRes] = await Promise.all([
        api.get("/technicians/dashboard"),
        api.get("/users/me"),
      ]);

      setDashboard(dashboardRes.data);
      setProfile(profileRes.data);
    } catch (err: any) {
      console.log("Dashboard:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const badgeValue = (value: number) => {
    if (!value) return "";
    return value > 99 ? "99+" : value.toString();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  const totalJobs =
    (dashboard?.pendingJobs ?? 0) +
    (dashboard?.acceptedJobs ?? 0) +
    (dashboard?.activeJobs ?? 0) +
    (dashboard?.completedJobs ?? 0);

  if (totalJobs === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="briefcase-outline" size={90} color="#334155" />

        <Text style={styles.emptyTitle}>No Jobs Assigned</Text>

        <Text style={styles.emptyText}>
          Once an administrator assigns work, your dashboard will automatically
          update.
        </Text>

        <Pressable style={styles.refreshButton} onPress={loadDashboard}>
          <Ionicons name="refresh" color="#fff" size={18} />

          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/images/dashboard-bg.png")}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      >
        {/* Dark overlay so the cards remain readable */}
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(2,6,23,0.82)",
          }}
        />
      </ImageBackground>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7c3aed"
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Welcome back</Text>

            <Text style={styles.title}>{profile?.name || "Technician"}</Text>

            <Text style={styles.subtitle}>Manage your assigned work</Text>
          </View>

          <Pressable
            style={styles.avatarContainer}
            onPress={() => navigation.navigate("TechnicianProfile")}
          >
            {/* Later this becomes the technician photo */}

            {profile?.profileImage ? (
              <Image
                source={{
                  uri: `${api.defaults.baseURL}/uploads/users/${profile.profileImage}`,
                }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="person" size={28} color="#fff" />
              </View>
            )}

            {/* Optional online indicator */}

            <View style={styles.onlineIndicator} />
          </Pressable>
        </View>

        <View style={styles.grid}>
          {/* Pending */}

          <Pressable
            style={[styles.card, styles.pending]}
            onPress={() =>
              navigation.navigate("Jobs", {
                status: "pending",
              })
            }
          >
            {dashboard?.pendingJobs > 0 && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: "#f59e0b",
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {badgeValue(dashboard.pendingJobs)}
                </Text>
              </View>
            )}

            <View style={styles.iconCircle}>
              <Text style={styles.cardNumber}>⏳</Text>
            </View>

            <Text style={styles.cardTitle}>Pending</Text>

            <Text style={styles.cardSub}>
              {dashboard?.pendingJobs
                ? `${dashboard.pendingJobs} waiting`
                : "No pending jobs"}
            </Text>
          </Pressable>

          {/* Accepted */}

          <Pressable
            style={[styles.card, styles.accepted]}
            onPress={() =>
              navigation.navigate("Jobs", {
                status: "accepted",
              })
            }
          >
            {dashboard?.acceptedJobs > 0 && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: "#7c3aed",
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {badgeValue(dashboard.acceptedJobs)}
                </Text>
              </View>
            )}

            <View style={styles.iconCircle}>
              <Text style={styles.cardNumber}>🤝</Text>
            </View>

            <Text style={styles.cardTitle}>Accepted</Text>

            <Text style={styles.cardSub}>
              {dashboard?.acceptedJobs
                ? `${dashboard.acceptedJobs} ready`
                : "No accepted jobs"}
            </Text>
          </Pressable>

          {/* In Progress */}

          <Pressable
            style={[styles.card, styles.inProgress]}
            onPress={() =>
              navigation.navigate("Jobs", {
                status: "in-progress",
              })
            }
          >
            {dashboard?.activeJobs > 0 && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: "#3b82f6",
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {badgeValue(dashboard.activeJobs)}
                </Text>
              </View>
            )}

            <View style={styles.iconCircle}>
              <Text style={styles.cardNumber}>⚙️</Text>
            </View>

            <Text style={styles.cardTitle}>In Progress</Text>

            <Text style={styles.cardSub}>
              {dashboard?.activeJobs
                ? `${dashboard.activeJobs} active`
                : "Nothing in progress"}
            </Text>
          </Pressable>

          {/* Completed */}

          <Pressable
            style={[styles.card, styles.completed]}
            onPress={() => navigation.navigate("Completed")}
          >
            {dashboard?.completedJobs > 0 && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: "#22c55e",
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {badgeValue(dashboard.completedJobs)}
                </Text>
              </View>
            )}

            <View style={styles.iconCircle}>
              <Text style={styles.cardNumber}>✅</Text>
            </View>

            <Text style={styles.cardTitle}>Completed</Text>

            <Text style={styles.cardSub}>
              {dashboard?.completedJobs
                ? `${dashboard.completedJobs} completed`
                : "No completed jobs"}
            </Text>
          </Pressable>

          {/* Scheduled Maintenance */}

          <Pressable
            style={[styles.card, styles.subscription]}
            onPress={() => navigation.navigate("ScheduledMaintenance")}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.cardNumber}>🔧</Text>
            </View>

            <Text style={styles.cardTitle}>Maintenance</Text>

            <Text style={styles.cardSub}>Scheduled maintenance visits</Text>
          </Pressable>

          {/* All Jobs */}

          <Pressable
            style={[styles.card, styles.all]}
            onPress={() => navigation.navigate("Jobs")}
          >
            {totalJobs > 0 && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: "#8b5cf6",
                  },
                ]}
              >
                <Text style={styles.badgeText}>{badgeValue(totalJobs)}</Text>
              </View>
            )}

            <View style={styles.iconCircle}>
              <Text style={styles.cardNumber}>📋</Text>
            </View>

            <Text style={styles.cardTitle}>All Jobs</Text>

            <Text style={styles.cardSub}>{totalJobs} assigned</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },

  headerLeft: {
    flex: 1,
  },

  greeting: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 4,
  },

  avatarContainer: {
    position: "relative",
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "rgba(124,58,237,0.25)",

    borderWidth: 2,
    borderColor: "#7c3aed",
  },

  onlineIndicator: {
    position: "absolute",

    right: 2,
    bottom: 2,

    width: 14,
    height: 14,
    borderRadius: 7,

    backgroundColor: "#22c55e",

    borderWidth: 2,
    borderColor: "#020617",
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 15,
    marginTop: 6,
    marginBottom: 28,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    paddingBottom: 50,
  },

  card: {
    width: "46%",
    backgroundColor: "rgba(15,23,42,0.82)",

    borderRadius: 20,

    padding: 18,

    marginBottom: 14,

    borderWidth: 1.2,

    borderColor: "rgba(255,255,255,0.08)",

    overflow: "hidden",

    shadowColor: "#000",

    shadowOpacity: 0.35,

    shadowRadius: 18,

    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 8,
  },

  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    elevation: 4,
    shadowColor: "#7c3aed",
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
  },

  cardNumber: {
    fontSize: 30,
    marginBottom: 14,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  cardSub: {
    color: "#94a3b8",
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
  },

  pending: {
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },

  accepted: {
    borderLeftWidth: 4,
    borderLeftColor: "#7c3aed",
  },

  inProgress: {
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },

  completed: {
    borderLeftWidth: 4,
    borderLeftColor: "#22c55e",
  },

  subscription: {
    borderLeftWidth: 4,
    borderLeftColor: "#ec4899",
  },

  all: {
    borderLeftWidth: 4,
    borderLeftColor: "#8b5cf6",
  },

  /* EMPTY STATE */

  emptyContainer: {
    flex: 1,
    backgroundColor: "#020617",

    justifyContent: "center",
    alignItems: "center",

    paddingHorizontal: 32,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 24,
  },

  emptyText: {
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 24,
    marginTop: 14,
    marginBottom: 34,
    fontSize: 15,
  },

  refreshButton: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#7c3aed",

    paddingHorizontal: 24,
    paddingVertical: 14,

    borderRadius: 14,
  },

  refreshText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 10,
    fontSize: 15,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "rgba(124,58,237,0.12)",

    marginBottom: 16,
  },
  content: {
    paddingBottom: 40,
  },
});
