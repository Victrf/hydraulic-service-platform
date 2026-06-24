// only showing changed + added parts clearly integrated into your structure

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput, // ✅ ADD
  Pressable, // ✅ ADD
} from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Ionicons } from "@expo/vector-icons";

export default function ReportsScreen() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(""); // ✅ ADD
  const [viewMode, setViewMode] = useState<"card" | "table">("card"); // ✅ ADD

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const res = await api.get("/reports");
      setReports(res.data || []);
    } catch (err) {
      console.log(err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ SEARCH FILTER
  const filteredReports = reports.filter((r) => {
    const q = search.toLowerCase();

    const request = r.serviceRequest;
    const equipment = request?.equipment;
    const company = request?.company;
    const technician = request?.assignment?.technician;

    return (
      request?.description?.toLowerCase().includes(q) ||
      equipment?.name?.toLowerCase().includes(q) ||
      company?.name?.toLowerCase().includes(q) ||
      technician?.name?.toLowerCase().includes(q) ||
      (r.notes || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Reports</Text>
          <Text style={styles.subtitle}>
            Completed service reports overview
          </Text>
        </View>

        {/* TOGGLE */}
        <Pressable
          style={styles.toggleBtn}
          onPress={() =>
            setViewMode((prev) => (prev === "card" ? "table" : "card"))
          }
        >
          <Ionicons
            name={viewMode === "card" ? "grid-outline" : "list-outline"}
            size={18}
            color="#fff"
          />
        </Pressable>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#9ca3af" />

        <TextInput
          placeholder="Search reports..."
          placeholderTextColor="#6b7280"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />

        {search ? (
          <Pressable onPress={() => setSearch("")}>
            <Ionicons name="close" size={16} color="#9ca3af" />
          </Pressable>
        ) : null}
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{filteredReports.length}</Text>
          <Text style={styles.statLabel}>Total Reports</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {filteredReports.filter((r) => r.notes).length}
          </Text>
          <Text style={styles.statLabel}>With Notes</Text>
        </View>
      </View>

      {/* TABLE HEADER */}
      {viewMode === "table" && (
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Company</Text>
          <Text style={styles.headerCell}>Equipment</Text>
          <Text style={styles.headerCell}>Technician</Text>
          <Text style={styles.headerCell}>Notes</Text>
        </View>
      )}

      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          const request = item.serviceRequest;
          const equipment = request?.equipment;
          const company = request?.company;
          const technician = request?.assignment?.technician;

          return viewMode === "card" ? (
            // ✅ YOUR EXISTING CARD (UNCHANGED)
            <View style={styles.card}>
              <View style={styles.topRow}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color="#7c3aed"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.requestTitle}>
                    {request?.description || "Service Request"}
                  </Text>

                  <Text style={styles.metaSmall}>
                    {company?.name || "-"} • {equipment?.name || "-"}
                  </Text>
                </View>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Completed</Text>
                </View>
              </View>

              <Text style={styles.meta}>
                Technician: {technician?.name || "Unassigned"}
              </Text>

              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>Report Notes</Text>
                <Text style={styles.notes}>
                  {item.notes || "No notes provided"}
                </Text>
              </View>
            </View>
          ) : (
            // ✅ TABLE VIEW
            <View style={styles.tableRow}>
              <Text style={styles.cell}>{company?.name || "-"}</Text>
              <Text style={styles.cell}>{equipment?.name || "-"}</Text>
              <Text style={styles.cell}>
                {technician?.name || "-"}
              </Text>
              <Text style={styles.cell}>
                {item.notes ? "Yes" : "No"}
              </Text>
            </View>
          );
        }}
      />
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
    marginBottom: 16,
  },

  headerRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
},

toggleBtn: {
  backgroundColor: "#334155",
  padding: 10,
  borderRadius: 12,
},

searchBox: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#0f172a",
  borderRadius: 12,
  paddingHorizontal: 10,
  paddingVertical: 8,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#1e293b",
},

searchInput: {
  flex: 1,
  marginLeft: 8,
  color: "#fff",
},

tableHeader: {
  flexDirection: "row",
  borderBottomWidth: 1,
  borderColor: "#1e293b",
  paddingBottom: 6,
  marginBottom: 6,
},

headerCell: {
  flex: 1,
  color: "#9ca3af",
  fontSize: 12,
},

tableRow: {
  flexDirection: "row",
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderColor: "#1e293b",
},

cell: {
  flex: 1,
  color: "#fff",
  fontSize: 12,
},

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },

  subtitle: {
    color: "#9ca3af",
    marginTop: 4,
    fontSize: 13,
  },

  /* 🔥 STATS */
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  statLabel: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 2,
  },

  /* CARD */
  card: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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

  requestTitle: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  metaSmall: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 2,
  },

  badge: {
    backgroundColor: "#1e1b4b",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  badgeText: {
    color: "#a78bfa",
    fontSize: 10,
    fontWeight: "600",
  },

  meta: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 4,
  },

  notesBox: {
    marginTop: 10,
    backgroundColor: "#020617",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  notesLabel: {
    color: "#7c3aed",
    fontSize: 12,
    marginBottom: 4,
  },

  notes: {
    color: "#e5e7eb",
    fontSize: 13,
  },

  /* EMPTY */
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyCard: {
    width: "100%",
    backgroundColor: "#0f172a",
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden",
  },

  glow: {
    position: "absolute",
    width: 200,
    height: 200,
    backgroundColor: "#7c3aed",
    opacity: 0.15,
    borderRadius: 100,
    top: -60,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1e1b4b",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    fontSize: 13,
  },

  flowBox: {
    marginTop: 16,
    backgroundColor: "#020617",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  flowText: {
    color: "#7c3aed",
    fontSize: 12,
    fontWeight: "500",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
