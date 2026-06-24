import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { api } from "../../api/client";

export default function JobsScreen() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const status = route.params?.status;

  useEffect(() => {
    loadJobs();
  }, [status]);

  const loadJobs = async () => {
    try {
      setLoading(true);

      // ✅ FIX 1: normalize status
      const normalizedStatus = status?.replace("-", "_");

      const url = normalizedStatus
        ? `/technicians/my-jobs?status=${normalizedStatus}`
        : `/technicians/my-jobs`;

      const res = await api.get(url);

      // ✅ FIX 2: safe response handling
      setJobs(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err: any) {
      console.log("JOB LOAD ERROR:", err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (requestId: string, status: string) => {
    try {
      await api.patch(`/service-requests/${requestId}/status`, { status });
      loadJobs();
    } catch (err) {
      console.log(err);
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>
        {status ? `${status.toUpperCase()} JOBS` : "ALL JOBS"}
      </Text>

      <FlatList
        data={jobs}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }: any) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.desc}>{item.description}</Text>
              <Text style={[styles.status, getStatusStyle(item.status)]}>
                {item.status}
              </Text>
            </View>

            <Text style={styles.meta}>
              🏢 {item.company?.name || "No company"}
            </Text>

            <Text style={styles.meta}>
              🛠 {item.equipment?.name || "No equipment"}
            </Text>

            {/* ACTIONS */}
            <View style={styles.actions}>
              {item.status === "pending" && (
                <Pressable
                  style={[styles.btn, styles.startBtn]}
                  onPress={() => updateStatus(item.id, "in-progress")}
                >
                  <Text style={styles.btnText}>Start</Text>
                </Pressable>
              )}

              {item.status === "in-progress" && (
                <>
                  <Pressable
                    style={[styles.btn, styles.completeBtn]}
                    onPress={() => updateStatus(item.id, "completed")}
                  >
                    <Text style={styles.btnText}>Complete</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.btn, styles.reportBtn]}
                    onPress={() =>
                      navigation.navigate("SubmitReport", {
                        requestId: item.id,
                      })
                    }
                  >
                    <Text style={styles.btnText}>Report</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

// 🔵 STATUS COLOR HELPER
const getStatusStyle = (status: string) => {
  switch (status) {
    case "pending":
      return { color: "#f59e0b" };
    case "in-progress":
      return { color: "#3b82f6" };
    case "completed":
      return { color: "#10b981" };
    default:
      return { color: "#94a3b8" };
  }
};

// 🎨 STYLES
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 20,
    paddingTop: 60,
  },

  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  desc: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    marginRight: 10,
  },

  status: {
    fontSize: 12,
    fontWeight: "600",
  },

  meta: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 4,
  },

  actions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },

  btn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  btnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  startBtn: {
    backgroundColor: "#3b82f6",
  },

  completeBtn: {
    backgroundColor: "#10b981",
  },

  reportBtn: {
    backgroundColor: "#6366f1",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
