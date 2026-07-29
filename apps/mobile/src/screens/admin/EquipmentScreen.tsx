import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "../../api/client";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function EquipmentScreen() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<any>();

  const loadEquipment = async () => {
    try {
      const res = await api.get("/equipment");
      setEquipment(res.data || []);
    } catch (err) {
      console.log("EQUIPMENT LOAD ERROR:", err);
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEquipment();
    }, []),
  );

  const deleteEquipment = (id: string, name: string) => {
    Alert.alert(
      "Delete Equipment",
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/equipment/${id}`);
              loadEquipment();
            } catch (err) {
              console.log("DELETE ERROR:", err);
              Alert.alert("Error", "Failed to delete equipment");
            }
          },
        },
      ],
    );
  };

  // GROUP BY COMPANY
  const grouped = equipment.reduce((acc: any, item: any) => {
    const companyName = item.company?.name || "Unassigned";
    if (!acc[companyName]) acc[companyName] = [];
    acc[companyName].push(item);
    return acc;
  }, {});

  const groupedArray = Object.entries(grouped);

  useEffect(() => {
    if (groupedArray.length > 0) {
      const first = groupedArray[0][0];
      setExpanded({ [first]: true });
    }
  }, [equipment]);

  const toggleCompany = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const getEquipmentIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("generator")) return "flash-outline";
    if (lower.includes("ac") || lower.includes("air")) return "snow-outline";
    if (lower.includes("pump")) return "water-outline";
    if (lower.includes("motor")) return "speedometer-outline";
    if (lower.includes("compressor")) return "settings-outline";
    if (lower.includes("lift") || lower.includes("crane"))
      return "arrow-up-outline";
    return "hardware-chip-outline";
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80",
      }}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.screen}>
        {/* HEADER */}
        <View style={styles.headerBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Equipment</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Equipment Inventory</Text>
          <Text style={styles.subtitle}>
            Manage and track company equipment
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Text style={styles.statValue}>{equipment.length}</Text>
              <Text style={styles.statLabel}>Total Units</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statValue}>{groupedArray.length}</Text>
              <Text style={styles.statLabel}>Companies</Text>
            </View>
          </View>

          <View style={styles.viewToggle}>
            <Pressable
              style={[
                styles.toggleBtn,
                viewMode === "card" && styles.toggleBtnActive,
              ]}
              onPress={() => setViewMode("card")}
            >
              <Ionicons
                name="grid-outline"
                size={18}
                color={viewMode === "card" ? "#fff" : "#94a3b8"}
              />
              <Text
                style={[
                  styles.toggleText,
                  viewMode === "card" && styles.toggleTextActive,
                ]}
              >
                Cards
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.toggleBtn,
                viewMode === "table" && styles.toggleBtnActive,
              ]}
              onPress={() => setViewMode("table")}
            >
              <Ionicons
                name="list-outline"
                size={18}
                color={viewMode === "table" ? "#fff" : "#94a3b8"}
              />
              <Text
                style={[
                  styles.toggleText,
                  viewMode === "table" && styles.toggleTextActive,
                ]}
              >
                Table
              </Text>
            </Pressable>
          </View>
        </View>

        <FlatList
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          data={groupedArray}
          keyExtractor={(item) => item[0]}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="cube-outline" size={40} color="#64748b" />
              </View>
              <Text style={styles.emptyTitle}>No Equipment</Text>
              <Text style={styles.emptySubtitle}>
                Add equipment to start tracking your inventory
              </Text>
            </View>
          )}
          renderItem={({ item }) => {
            const [companyName, items] = item as any;
            const isOpen = expanded[companyName];

            return (
              <View style={styles.companySection}>
                {/* COMPANY HEADER */}
                <Pressable
                  style={styles.companyHeader}
                  onPress={() => toggleCompany(companyName)}
                >
                  <View style={styles.companyHeaderLeft}>
                    {items[0]?.company?.logoUrl ? (
                      <Image
                        source={{
                          uri: `${api.defaults.baseURL}/uploads/companies/${items[0].company.logoUrl}`,
                        }}
                        style={styles.companyLogo}
                      />
                    ) : (
                      <View
                        style={[
                          styles.companyIconBox,
                          {
                            backgroundColor:
                              companyName === "Unassigned"
                                ? "rgba(239, 68, 68, 0.15)"
                                : "rgba(124, 58, 237, 0.15)",
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            companyName === "Unassigned"
                              ? "alert-circle-outline"
                              : "business-outline"
                          }
                          size={18}
                          color={
                            companyName === "Unassigned" ? "#f87171" : "#a78bfa"
                          }
                        />
                      </View>
                    )}
                    <View>
                      <Text style={styles.companyName}>{companyName}</Text>
                      <Text style={styles.companyCount}>
                        {items.length} unit{items.length > 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.expandIcon}>
                    <Animated.View
                      style={{
                        transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
                      }}
                    >
                      <Ionicons name="chevron-down" size={20} color="#94a3b8" />
                    </Animated.View>
                  </View>
                </Pressable>

                {/* EQUIPMENT LIST */}
                {isOpen && (
                  <View style={styles.equipmentList}>
                    {viewMode === "card"
                      ? items.map((eq: any) => (
                          <View key={eq.id} style={styles.equipmentCard}>
                            <View style={styles.equipmentTop}>
                              <View
                                style={[
                                  styles.equipmentIconBox,
                                  {
                                    backgroundColor: "rgba(59, 130, 246, 0.15)",
                                  },
                                ]}
                              >
                                <Ionicons
                                  name={getEquipmentIcon(eq.name) as any}
                                  size={22}
                                  color="#60a5fa"
                                />
                              </View>

                              <View style={{ flex: 1 }}>
                                <Text style={styles.equipmentName}>
                                  {eq.name}
                                </Text>
                                <View style={styles.equipmentMetaRow}>
                                  <Ionicons
                                    name="barcode-outline"
                                    size={12}
                                    color="#64748b"
                                  />
                                  <Text style={styles.equipmentMeta}>
                                    {eq.serialNumber}
                                  </Text>
                                </View>
                                {eq.brand && (
                                  <View style={styles.equipmentMetaRow}>
                                    <Ionicons
                                      name="pricetag-outline"
                                      size={12}
                                      color="#64748b"
                                    />
                                    <Text style={styles.equipmentMeta}>
                                      {eq.brand}
                                    </Text>
                                  </View>
                                )}
                              </View>

                              <View style={styles.equipmentStatus}>
                                <View
                                  style={[
                                    styles.statusDot,
                                    {
                                      backgroundColor: eq.isActive
                                        ? "#22c55e"
                                        : "#ef4444",
                                    },
                                  ]}
                                />
                              </View>
                            </View>

                            <View style={styles.equipmentDivider} />

                            <View style={styles.equipmentActions}>
                              <Pressable
                                style={styles.actionBtnSecondary}
                                onPress={() =>
                                  navigation.navigate("EditEquipment", {
                                    equipment: eq,
                                  })
                                }
                              >
                                <Ionicons
                                  name="create-outline"
                                  size={16}
                                  color="#a78bfa"
                                />
                                <Text style={styles.actionBtnSecondaryText}>
                                  Edit
                                </Text>
                              </Pressable>

                              <Pressable
                                style={styles.actionBtnDanger}
                                onPress={() => deleteEquipment(eq.id, eq.name)}
                              >
                                <Ionicons
                                  name="trash-outline"
                                  size={16}
                                  color="#f87171"
                                />
                                <Text style={styles.actionBtnDangerText}>
                                  Delete
                                </Text>
                              </Pressable>
                            </View>
                          </View>
                        ))
                      : items.map((eq: any) => (
                          <View key={eq.id} style={styles.tableRow}>
                            <View style={styles.tableCell}>
                              <Ionicons
                                name={getEquipmentIcon(eq.name) as any}
                                size={16}
                                color="#60a5fa"
                              />
                              <Text style={styles.tableCellText}>
                                {eq.name}
                              </Text>
                            </View>
                            <Text
                              style={[
                                styles.tableCellText,
                                { flex: 1, textAlign: "center" },
                              ]}
                            >
                              {eq.serialNumber}
                            </Text>
                            <Text
                              style={[
                                styles.tableCellText,
                                { flex: 1, textAlign: "center" },
                              ]}
                            >
                              {eq.brand || "-"}
                            </Text>
                            <View
                              style={[
                                styles.tableCell,
                                { justifyContent: "flex-end" },
                              ]}
                            >
                              <Pressable
                                style={styles.tableActionBtn}
                                onPress={() =>
                                  navigation.navigate("EditEquipment", {
                                    equipment: eq,
                                  })
                                }
                              >
                                <Ionicons
                                  name="create-outline"
                                  size={16}
                                  color="#a78bfa"
                                />
                              </Pressable>
                              <Pressable
                                style={styles.tableActionBtn}
                                onPress={() => deleteEquipment(eq.id, eq.name)}
                              >
                                <Ionicons
                                  name="trash-outline"
                                  size={16}
                                  color="#f87171"
                                />
                              </Pressable>
                            </View>
                          </View>
                        ))}
                  </View>
                )}
              </View>
            );
          }}
        />

        {/* FAB */}
        <Pressable
          style={styles.fab}
          onPress={() => navigation.navigate("CreateEquipment")}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  /* BACKGROUND */
  bgImage: {
    flex: 1,
    width: "100%",
    height: SCREEN_HEIGHT,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.92)",
  },

  /* SCREEN */
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },

  /* HEADER BAR */
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.5)",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  /* HEADER CONTENT */
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 4,
    fontSize: 14,
  },

  /* STATS */
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  statBadge: {
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.4)",
    alignItems: "center",
  },
  statValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },

  /* VIEW TOGGLE */
  viewToggle: {
    flexDirection: "row",
    gap: 8,
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.4)",
  },
  toggleBtnActive: {
    backgroundColor: "#7c3aed",
    borderColor: "#7c3aed",
  },
  toggleText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#fff",
  },

  /* COMPANY SECTION */
  companySection: {
    marginBottom: 16,
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(17, 24, 39, 0.55)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.4)",
  },
  companyHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  companyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  companyName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  companyCount: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  expandIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  /* EQUIPMENT LIST */
  equipmentList: {
    marginTop: 10,
    gap: 10,
  },

  /* EQUIPMENT CARD */
  equipmentCard: {
    backgroundColor: "rgba(17, 24, 39, 0.45)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.35)",
    overflow: "hidden",
  },
  equipmentTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  equipmentIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  equipmentName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  equipmentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  equipmentMeta: {
    color: "#94a3b8",
    fontSize: 12,
  },
  equipmentStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  /* DIVIDER */
  equipmentDivider: {
    height: 1,
    backgroundColor: "rgba(30, 41, 59, 0.35)",
  },

  /* ACTIONS */
  equipmentActions: {
    flexDirection: "row",
    padding: 12,
    gap: 10,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(124, 58, 237, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.2)",
  },
  actionBtnSecondaryText: {
    color: "#a78bfa",
    fontWeight: "700",
    fontSize: 13,
  },
  actionBtnDanger: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  actionBtnDangerText: {
    color: "#f87171",
    fontWeight: "700",
    fontSize: 13,
  },

  /* TABLE VIEW */
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(17, 24, 39, 0.45)",
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.35)",
  },
  tableCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1.5,
  },
  tableCellText: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "500",
  },
  tableActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },

  /* EMPTY STATE */
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 30,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(17, 24, 39, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  /* FAB */
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#7c3aed",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.4)",
  },
});
