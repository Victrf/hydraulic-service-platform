import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Ionicons } from "@expo/vector-icons";

export default function RequestDetailScreen({ route, navigation }: any) {
  const { id } = route.params;

  const [request, setRequest] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    loadRequest();
    loadEvents();
  }, []);

  const loadRequest = async () => {
    try {
      const res = await api.get(`/service-requests/${id}`);
      setRequest(res.data);
    } catch (err) {
      console.log("LOAD REQUEST ERROR:", err);
    }
  };

  const loadEvents = async () => {
    try {
      const res = await api.get(`/service-requests/${id}/events`);
      setEvents(res.data || []);
    } catch (err) {
      console.log("EVENT ERROR:", err);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/service-requests/${id}/status`, { status });

      await loadRequest();
      await loadEvents();
    } catch (err) {
      console.log("STATUS ERROR:", err);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "completed") return "#10b981";
    if (status === "in-progress") return "#f59e0b";
    return "#3b82f6";
  };

  if (!request) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: "#9ca3af" }}>Loading request...</Text>
      </View>
    );
  }

  const isCompleted = request.status === "completed";

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 40 }}>
        <Text style={styles.title}>Request Details</Text>
        <Text style={styles.subtitle}>
          View and manage this service request
        </Text>

        {/* STATUS */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(request.status) },
              ]}
            >
              <Text style={styles.statusText}>{request.status}</Text>
            </View>
          </View>
        </View>

        {/* INFO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Request Info</Text>
          <Info label="Description" value={request.description} />
          <Info label="Location" value={request.location} />
          <Info label="Company" value={request.company?.name} />
          <Info label="Equipment" value={request.equipment?.name} />
        </View>

        {/* ✅ IMAGES (READ-ONLY) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Images</Text>

          {request.images?.length > 0 ? (
            request.images.map((img: any) => (
              <Image
                key={img.id}
                source={{
                  uri: `${api.defaults.baseURL}/uploads/service-requests/${img.url}`,
                }}
                style={styles.image}
              />
            ))
          ) : (
            <Text style={{ color: "#6b7280" }}>No images</Text>
          )}
        </View>

        {/* ASSIGNMENT */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Assignment</Text>

          {request.assignment?.technician ? (
            <Text style={styles.value}>
              {request.assignment.technician.name}
            </Text>
          ) : (
            <Text style={{ color: "#ef4444" }}>⚠ Not Assigned</Text>
          )}
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <Pressable
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate("AssignTechnician", {
                requestId: request.id,
              })
            }
          >
            <Ionicons name="person-add" size={16} color="#fff" />
            <Text style={styles.primaryText}>Assign Technician</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryBtn}
            onPress={() => updateStatus("in-progress")}
          >
            <Text style={{ color: "#f59e0b" }}>Start Work</Text>
          </Pressable>

          <Pressable
            style={[styles.secondaryBtn, isCompleted && { opacity: 0.5 }]}
            disabled={isCompleted}
            onPress={() => updateStatus("completed")}
          >
            <Text style={{ color: "#10b981" }}>
              {isCompleted ? "Completed" : "Mark Completed"}
            </Text>
          </Pressable>
        </View>

        {/* TIMELINE */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Activity Timeline</Text>

          {events.length === 0 ? (
            <Text style={{ color: "#6b7280" }}>No activity yet</Text>
          ) : (
            events.map((e) => (
              <View key={e.id} style={styles.eventRow}>
                <Ionicons name="time-outline" size={14} color="#6b7280" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.value}>{e.message}</Text>
                  <Text style={styles.eventDate}>
                    {new Date(e.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const Info = ({ label, value }: any) => (
  <View style={{ marginTop: 10 }}>
    <Text style={{ color: "#9ca3af", fontSize: 12 }}>{label}</Text>
    <Text style={{ color: "#fff", marginTop: 2 }}>{value || "-"}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#9ca3af", marginTop: 4, marginBottom: 16 },
  card: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: { color: "#fff", fontWeight: "600", marginBottom: 6 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { color: "#9ca3af" },
  value: { color: "#fff" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { color: "#fff", fontSize: 12 },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#7c3aed",
    padding: 12,
    borderRadius: 12,
  },
  primaryText: { color: "#fff", fontWeight: "600" },
  secondaryBtn: {
    backgroundColor: "#1f2937",
    padding: 12,
    borderRadius: 12,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
  },
  eventDate: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 2,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 10,
  },
});
