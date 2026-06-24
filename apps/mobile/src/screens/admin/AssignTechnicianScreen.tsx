import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function AssignTechnicianScreen({ route }: any) {
  const { requestId } = route.params;
  const navigation = useNavigation<any>();

  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTechs();
  }, []);

  const loadTechs = async () => {
    try {
      const res = await api.get("/users");

      // ✅ safe handling (array or wrapped)
      const users = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      const technicians = users.filter(
        (u: any) => u.role === "technician"
      );

      setTechs(technicians);

    } catch (err: any) {
      console.log("LOAD TECH ERROR:", err?.response?.data || err.message);
      Alert.alert("Error", "Failed to load technicians");
      setTechs([]);
    }
  };

  const assign = async (techId: string) => {
    try {
      setLoading(true);

      await api.post("/assignments", {
        serviceRequestId: requestId,
        technicianId: techId,
      });

      Alert.alert("Success", "Technician assigned");
      navigation.goBack();

    } catch (err: any) {
      console.log("ASSIGN ERROR:", err?.response?.data || err.message);

      Alert.alert(
        "Assignment failed",
        err?.response?.data?.message ||
          "You must be admin or assignment already exists"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={techs}
        keyExtractor={(item: any) => item.id}
        ListHeaderComponent={() => (
          <>
            <Text style={styles.title}>Assign Technician</Text>
            <Text style={styles.subtitle}>
              Select a technician to handle this request
            </Text>
          </>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={50} color="#374151" />
            <Text style={styles.emptyTitle}>No Technicians Available</Text>
            <Text style={styles.emptySubtitle}>
              Add technicians to assign them to requests
            </Text>
          </View>
        )}
        renderItem={({ item }: any) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={18} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {item.email || "No email"}
                </Text>
              </View>
            </View>

            <Pressable
              style={[
                styles.assignBtn,
                loading && { opacity: 0.6 },
              ]}
              onPress={() => assign(item.id)}
              disabled={loading}
            >
              <Ionicons name="person-add" size={16} color="#fff" />
              <Text style={styles.assignText}>
                {loading ? "Assigning..." : "Assign Technician"}
              </Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}




const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    color: "#9ca3af",
    marginTop: 4,
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  name: {
    color: "#fff",
    fontWeight: "600",
  },

  meta: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },

  assignBtn: {
    backgroundColor: "#7c3aed",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  assignText: {
    color: "#fff",
    fontWeight: "600",
  },

  emptyState: {
    marginTop: 80,
    alignItems: "center",
  },

  emptyTitle: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },

  emptySubtitle: {
    color: "#9ca3af",
    marginTop: 4,
    textAlign: "center",
  },
});
