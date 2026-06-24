import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function TechnicianDashboard() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Technician</Text>
      <Text style={styles.subtitle}>Manage your assigned work</Text>

      <View style={styles.grid}>
        {/* ✅ PENDING */}
        <Pressable
          style={[styles.card, styles.pending]}
          onPress={() => navigation.navigate("Jobs", { status: "pending" })}
        >
          <Text style={styles.cardNumber}>⏳</Text>
          <Text style={styles.cardTitle}>Pending</Text>
          <Text style={styles.cardSub}>Jobs to start</Text>
        </Pressable>

        {/* ✅ IN PROGRESS (RESTORED) */}
        <Pressable
          style={[styles.card, styles.inProgress]}
          onPress={() => navigation.navigate("Jobs", { status: "in-progress" })}
        >
          <Text style={styles.cardNumber}>⚙️</Text>
          <Text style={styles.cardTitle}>In Progress</Text>
          <Text style={styles.cardSub}>Active work</Text>
        </Pressable>

        {/* ✅ REPORT */}
        <Pressable
          style={[styles.card, styles.report]}
          onPress={() => navigation.navigate("Jobs", { status: "report" })}
        >
          <Text style={styles.cardNumber}>📝</Text>
          <Text style={styles.cardTitle}>Report</Text>
          <Text style={styles.cardSub}>Submit job reports</Text>
        </Pressable>

        {/* ✅ COMPLETED */}
        <Pressable
          style={[styles.card, styles.completed]}
          onPress={() => navigation.navigate("Jobs", { status: "completed" })}
        >
          <Text style={styles.cardNumber}>✅</Text>
          <Text style={styles.cardTitle}>Completed</Text>
          <Text style={styles.cardSub}>Finished jobs</Text>
        </Pressable>

        {/* 🆕 SUBSCRIPTION JOBS (placeholder) */}
        <Pressable
          style={[styles.card, styles.subscription]}
          onPress={() => {
            // 🚧 placeholder (connect later)
            console.log("Subscription jobs clicked");
          }}
        >
          <Text style={styles.cardNumber}>🔁</Text>
          <Text style={styles.cardTitle}>Subscriptions</Text>
          <Text style={styles.cardSub}>Recurring service jobs</Text>
        </Pressable>

        {/* ✅ ALL JOBS */}
        <Pressable
          style={[styles.card, styles.all]}
          onPress={() => navigation.navigate("Jobs")}
        >
          <Text style={styles.cardNumber}>📋</Text>
          <Text style={styles.cardTitle}>All Jobs</Text>
          <Text style={styles.cardSub}>View everything</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 20,
    paddingTop: 60,
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },

  subtitle: {
    color: "#64748b",
    marginBottom: 30,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  card: {
    width: "48%",
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  cardNumber: {
    fontSize: 26,
    marginBottom: 10,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  cardSub: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },

  pending: {
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },

  inProgress: {
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },

  report: {
    borderLeftWidth: 4,
    borderLeftColor: "#6366f1",
  },

  completed: {
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },

  subscription: {
    borderLeftWidth: 4,
    borderLeftColor: "#ec4899", // pink accent
  },

  all: {
    borderLeftWidth: 4,
    borderLeftColor: "#8b5cf6",
  },
});
