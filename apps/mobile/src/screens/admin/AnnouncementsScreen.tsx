import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useState, useCallback } from "react";
import { api } from "../../api/client";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      loadAnnouncements();
    }, []),
  );

  const loadAnnouncements = async () => {
    try {
      setLoading(true);

      const res = await api.get("/announcements");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setAnnouncements(data);
    } catch (err: any) {
      console.log("LOAD ERROR:", err?.response?.data || err.message);
      Alert.alert("Error", "Failed to load announcements");
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Announcement", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/announcements/${id}`);
            setAnnouncements((prev) =>
              prev.filter((a) => a.id !== id),
            );
          } catch (err: any) {
            console.log("DELETE ERROR:", err?.response?.data || err.message);
            Alert.alert("Delete failed");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Ionicons name="megaphone-outline" size={28} color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Announcements</Text>
          <Text style={styles.subtitle}>Broadcast updates to users</Text>
        </View>

        <Pressable
          style={styles.addBtn}
          onPress={() => navigation.navigate("CreateAnnouncement")}
        >
          <Ionicons name="add" size={18} color="#fff" />
        </Pressable>
      </View>

      {/* TOGGLE */}
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <Pressable
          onPress={() => setViewMode("card")}
          style={[
            styles.toggleBtn,
            viewMode === "card" && styles.activeToggle,
          ]}
        >
          <Text style={{ color: "#fff" }}>Card</Text>
        </Pressable>

        <Pressable
          onPress={() => setViewMode("table")}
          style={[
            styles.toggleBtn,
            viewMode === "table" && styles.activeToggle,
          ]}
        >
          <Text style={{ color: "#fff" }}>Table</Text>
        </Pressable>
      </View>

      {/* CONTENT */}
      {viewMode === "card" ? (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.iconBox}>
                <Ionicons name="megaphone-outline" size={16} color="#7c3aed" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.titleText}>{item.title}</Text>

                <Text style={styles.content}>
                  {item.content?.length > 80
                    ? item.content.slice(0, 80) + "..."
                    : item.content}
                </Text>

                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>

                <View style={styles.actions}>
                  <Pressable
                    style={styles.editBtn}
                    onPress={() =>
                      navigation.navigate("EditAnnouncement", {
                        announcement: item,
                      })
                    }
                  >
                    <Text style={{ color: "#fff" }}>Edit</Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Text style={{ color: "#fff" }}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        />
      ) : (
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.th}>Title</Text>
            <Text style={styles.th}>Date</Text>
            <Text style={styles.th}>Actions</Text>
          </View>

          {announcements.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.td} numberOfLines={1}>
                {item.title}
              </Text>

              <Text style={styles.td}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>

              <View style={{ flexDirection: "row", gap: 6 }}>
                <Pressable
                  style={styles.smallEdit}
                  onPress={() =>
                    navigation.navigate("EditAnnouncement", {
                      announcement: item,
                    })
                  }
                >
                  <Text style={{ color: "#fff" }}>E</Text>
                </Pressable>

                <Pressable
                  style={styles.smallDelete}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={{ color: "#fff" }}>D</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 16,
    paddingTop: 50,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 12,
  },

  addBtn: {
    backgroundColor: "#7c3aed",
    padding: 10,
    borderRadius: 12,
  },

  toggleBtn: {
    backgroundColor: "#1f2937",
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },

  activeToggle: {
    backgroundColor: "#7c3aed",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#1e1b4b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  titleText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  content: {
    color: "#9ca3af",
    marginTop: 4,
    fontSize: 12,
  },

  date: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 6,
  },

  actions: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },

  editBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  deleteBtn: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#374151",
    paddingBottom: 6,
    marginBottom: 6,
  },

  th: {
    color: "#9ca3af",
    fontSize: 12,
    flex: 1,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#1e293b",
  },

  td: {
    color: "#fff",
    flex: 1,
    fontSize: 12,
  },

  smallEdit: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 6,
    borderRadius: 6,
    marginRight: 4,
  },

  smallDelete: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 6,
    borderRadius: 6,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});