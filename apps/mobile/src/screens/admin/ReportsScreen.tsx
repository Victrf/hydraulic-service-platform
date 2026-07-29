import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Pressable,
  Image,
  Animated,
} from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import { useNavigation } from "@react-navigation/native";

export default function ReportsScreen() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadReports();
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
    ]).start();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reports");
      setReports(res.data || []);
    } catch (err) {
      console.log("REPORTS ERROR:", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return reports;
    return reports.filter((report) => {
      const request = report.serviceRequest;
      const equipment = request?.equipment;
      const company = request?.company;
      const technician = request?.assignment?.technician;
      return (
        company?.name?.toLowerCase().includes(term) ||
        equipment?.name?.toLowerCase().includes(term) ||
        technician?.name?.toLowerCase().includes(term)
      );
    });
  }, [reports, search]);

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.bgAccent} />
        <View style={styles.bgAccent2} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Background Accents */}
      <View style={styles.bgAccent} />
      <View style={styles.bgAccent2} />

      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTag}>SERVICE LOGS</Text>
            <Text style={styles.title}>Reports</Text>
            <Text style={styles.subtitle}>
              Browse and manage completed service reports
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.toggleButton,
              pressed && styles.toggleButtonPressed,
            ]}
            onPress={() =>
              setViewMode((prev) => (prev === "card" ? "table" : "card"))
            }
          >
            <Ionicons
              name={viewMode === "card" ? "list-outline" : "grid-outline"}
              size={20}
              color="#fff"
            />
          </Pressable>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by company, equipment, or technician..."
            placeholderTextColor="#475569"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#64748b" />
            </Pressable>
          )}
        </View>

        {/* STATS BAR */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{filteredReports.length}</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {new Set(reports.map((r) => r.serviceRequest?.company?.id)).size}
            </Text>
            <Text style={styles.statLabel}>Companies</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {
                new Set(
                  reports.map(
                    (r) => r.serviceRequest?.assignment?.technician?.id,
                  ),
                ).size
              }
            </Text>
            <Text style={styles.statLabel}>Technicians</Text>
          </View>
        </View>

        {/* TABLE HEADER */}
        {viewMode === "table" && (
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 1.2 }]}>Technician</Text>
            <Text style={styles.headerCell}>Company</Text>
            <Text style={styles.headerCell}>Equipment</Text>
            <Text style={[styles.headerCell, { flex: 0.8 }]}>Date</Text>
          </View>
        )}

        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
            flexGrow: filteredReports.length === 0 ? 1 : 0,
          }}
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title="No Reports Found"
              message="Completed service reports will appear here once available."
            />
          }
          renderItem={({ item, index }) => {
            const request = item.serviceRequest;
            const company = request?.company;
            const equipment = request?.equipment;
            const technician = request?.assignment?.technician;
            const completedDate = item.createdAt || request?.updatedAt;

            if (viewMode === "table") {
              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.tableRow,
                    pressed && styles.tableRowPressed,
                    index === 0 && { borderTopWidth: 0 },
                  ]}
                  onPress={() =>
                    navigation.navigate("ReportDetails", {
                      reportId: item.id,
                    })
                  }
                >
                  <View
                    style={[
                      styles.cell,
                      { flex: 1.2, flexDirection: "row", alignItems: "center" },
                    ]}
                  >
                    <View style={styles.miniAvatar}>
                      <Text style={styles.miniAvatarText}>
                        {technician?.name?.charAt(0)?.toUpperCase() || "T"}
                      </Text>
                    </View>
                    <Text style={styles.cellText} numberOfLines={1}>
                      {technician?.name || "-"}
                    </Text>
                  </View>
                  <Text style={styles.cellText} numberOfLines={1}>
                    {company?.name || "-"}
                  </Text>
                  <Text style={styles.cellText} numberOfLines={1}>
                    {equipment?.name || "-"}
                  </Text>
                  <Text
                    style={[styles.cellText, { flex: 0.8 }]}
                    numberOfLines={1}
                  >
                    {completedDate
                      ? new Date(completedDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </Text>
                </Pressable>
              );
            }

            return (
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
                onPress={() =>
                  navigation.navigate("ReportDetails", {
                    reportId: item.id,
                  })
                }
              >
                {/* CARD HEADER */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    {technician?.profileImage ? (
                      <Image
                        source={{
                          uri: `${api.defaults.baseURL}/uploads/users/${technician.profileImage}`,
                        }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {technician?.name?.charAt(0)?.toUpperCase() || "T"}
                        </Text>
                      </View>
                    )}

                    <View style={styles.headerInfo}>
                      <Text style={styles.techName} numberOfLines={1}>
                        {technician?.name || "Unassigned"}
                      </Text>
                      <Text style={styles.techRole}>Field Technician</Text>
                    </View>
                  </View>

                  <View style={styles.completedBadge}>
                    <View style={styles.badgeDot} />
                    <Text style={styles.completedBadgeText}>Done</Text>
                  </View>
                </View>

                {/* DIVIDER */}
                <View style={styles.divider} />

                {/* INFO ROWS */}
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconBox}>
                      <Ionicons
                        name="business-outline"
                        size={16}
                        color="#818cf8"
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Company</Text>
                      <Text style={styles.infoValue} numberOfLines={1}>
                        {company?.name || "No Company"}
                      </Text>
                    </View>
                    {company?.logoUrl ? (
                      <Image
                        source={{
                          uri: `${api.defaults.baseURL}/uploads/companies/${company.logoUrl}`,
                        }}
                        style={styles.companyLogo}
                      />
                    ) : (
                      <View style={styles.companyPlaceholder}>
                        <Text style={styles.companyPlaceholderText}>
                          {company?.name?.charAt(0)?.toUpperCase() || "C"}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoIconBox}>
                      <Ionicons
                        name="hardware-chip-outline"
                        size={16}
                        color="#818cf8"
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Equipment</Text>
                      <Text style={styles.infoValue} numberOfLines={1}>
                        {equipment?.name || "-"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoIconBox}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color="#818cf8"
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Completed</Text>
                      <Text style={styles.infoValue}>
                        {completedDate
                          ? new Date(completedDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : "-"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* FOOTER */}
                <View style={styles.cardFooter}>
                  <Text style={styles.viewText}>View Full Report</Text>
                  <Ionicons name="arrow-forward" size={16} color="#6366f1" />
                </View>
              </Pressable>
            );
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#030712",
  },

  bgAccent: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#4f46e5",
    opacity: 0.12,
  },

  bgAccent2: {
    position: "absolute",
    bottom: -60,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#7c3aed",
    opacity: 0.1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#64748b",
    marginTop: 16,
    fontSize: 14,
    fontWeight: "500",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },

  headerTag: {
    color: "#6366f1",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  title: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 6,
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: "80%",
  },

  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  toggleButtonPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: "rgba(15, 23, 42, 1)",
  },

  /* SEARCH */
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  searchInput: {
    flex: 1,
    color: "#f1f5f9",
    fontSize: 15,
    paddingVertical: 14,
    marginLeft: 10,
    fontWeight: "500",
  },

  clearBtn: {
    padding: 4,
  },

  /* STATS */
  statsBar: {
    flexDirection: "row",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 2,
  },

  statLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },

  /* TABLE */
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 4,
  },

  headerCell: {
    flex: 1,
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    borderRadius: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
  },

  tableRowPressed: {
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderColor: "rgba(99, 102, 241, 0.2)",
  },

  cell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  cellText: {
    flex: 1,
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "500",
  },

  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  miniAvatarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  /* CARDS */
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },

  cardPressed: {
    transform: [{ scale: 0.98 }],
    borderColor: "rgba(99, 102, 241, 0.2)",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(79, 70, 229, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },

  avatarText: {
    color: "#818cf8",
    fontSize: 18,
    fontWeight: "700",
  },

  headerInfo: {
    flex: 1,
  },

  techName: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },

  techRole: {
    color: "#64748b",
    marginTop: 2,
    fontSize: 12,
    fontWeight: "500",
  },

  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },

  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e",
    marginRight: 6,
  },

  completedBadgeText: {
    color: "#4ade80",
    fontSize: 11,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginVertical: 14,
  },

  infoSection: {
    gap: 10,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 1,
  },

  infoValue: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "600",
  },

  companyLogo: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },

  companyPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  companyPlaceholderText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },

  viewText: {
    color: "#818cf8",
    fontSize: 14,
    fontWeight: "700",
    marginRight: 6,
  },
});
