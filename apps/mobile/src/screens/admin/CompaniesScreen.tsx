import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  Alert,
  TextInput,
  Animated,
} from "react-native";
import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "../../api/client";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function CompaniesScreen() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const navigation = useNavigation<any>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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

  const loadCompanies = async () => {
    try {
      const res = await api.get("/companies");
      setCompanies(res.data || []);
    } catch (err) {
      console.log("COMPANY LOAD ERROR:", err);
      setCompanies([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCompanies();
    }, []),
  );

  const deleteCompany = (id: string) => {
    Alert.alert(
      "Delete Company",
      "Are you sure you want to delete this company? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/companies/${id}`);
              loadCompanies();
            } catch (err: any) {
              Alert.alert(
                "Delete Failed",
                err?.response?.data?.message || "Could not delete company",
              );
            }
          },
        },
      ],
    );
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const filtered = companies.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const EmptyState = ({
    icon,
    title,
    message,
    buttonText,
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    message: string;
    buttonText?: string;
    onPress?: () => void;
  }) => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconBox}>
        <Ionicons name={icon} size={40} color="#64748b" />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {buttonText && onPress && (
        <Pressable style={styles.emptyButton} onPress={onPress}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.emptyButtonText}>{buttonText}</Text>
        </Pressable>
      )}
    </View>
  );

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
            <Text style={styles.headerTag}>DIRECTORY</Text>
            <Text style={styles.title}>Companies</Text>
            <Text style={styles.subtitle}>
              Manage your client companies and their details
            </Text>
          </View>

          <View style={styles.toggle}>
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
                color={viewMode === "card" ? "#fff" : "#64748b"}
              />
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
                color={viewMode === "table" ? "#fff" : "#64748b"}
              />
            </Pressable>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#64748b" />
          <TextInput
            placeholder="Search companies..."
            placeholderTextColor="#475569"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#64748b" />
            </Pressable>
          )}
        </View>

        {/* STATS */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{companies.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{filtered.length}</Text>
            <Text style={styles.statLabel}>Showing</Text>
          </View>
        </View>

        {/* TABLE HEADER */}
        {viewMode === "table" && (
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>Company</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "center" }]}>
              Contact
            </Text>
            <Text style={[styles.th, { flex: 0.8, textAlign: "right" }]}>
              Actions
            </Text>
          </View>
        )}

        <FlatList
          data={filtered}
          ListEmptyComponent={() => {
            if (companies.length === 0) {
              return (
                <EmptyState
                  icon="business-outline"
                  title="No Companies Yet"
                  message="Create your first company to start managing equipment and service requests."
                  buttonText="Create Company"
                  onPress={() => navigation.navigate("CreateCompany")}
                />
              );
            }
            return (
              <EmptyState
                icon="search-outline"
                title="No Results Found"
                message="Try searching for a different company name."
              />
            );
          }}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item, index }) =>
            viewMode === "card" ? (
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
                onPress={() =>
                  navigation.navigate("CompanyDetails", {
                    companyId: item.id,
                  })
                }
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardLeft}>
                    {item.logoUrl ? (
                      <Image
                        source={{
                          uri: `${api.defaults.baseURL}/uploads/companies/${item.logoUrl}`,
                        }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {getInitials(item.name)}
                        </Text>
                      </View>
                    )}

                    <View style={styles.cardInfo}>
                      <Text style={styles.name} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.metaRow}>
                        <Ionicons
                          name="location-outline"
                          size={12}
                          color="#64748b"
                        />
                        <Text style={styles.meta} numberOfLines={1}>
                          {item.address || "No address"}
                        </Text>
                      </View>
                      <View style={styles.metaRow}>
                        <Ionicons
                          name="call-outline"
                          size={12}
                          color="#64748b"
                        />
                        <Text style={styles.meta}>
                          {item.phone || "No phone"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.actions}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.iconBtn,
                        styles.editBtn,
                        pressed && styles.iconBtnPressed,
                      ]}
                      onPress={() =>
                        navigation.navigate("EditCompany", {
                          company: item,
                        })
                      }
                    >
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color="#38bdf8"
                      />
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.iconBtn,
                        styles.deleteBtn,
                        pressed && styles.iconBtnPressed,
                      ]}
                      onPress={() => deleteCompany(item.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#f87171"
                      />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.viewDetails}>View Details</Text>
                  <Ionicons name="arrow-forward" size={14} color="#6366f1" />
                </View>
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.tableRow,
                  pressed && styles.tableRowPressed,
                ]}
                onPress={() =>
                  navigation.navigate("CompanyDetails", {
                    companyId: item.id,
                  })
                }
              >
                <View style={[{ flex: 2 }, styles.tableCell]}>
                  <View style={styles.tableAvatar}>
                    {item.logoUrl ? (
                      <Image
                        source={{
                          uri: `${api.defaults.baseURL}/uploads/companies/${item.logoUrl}`,
                        }}
                        style={styles.tableAvatarImg}
                      />
                    ) : (
                      <Text style={styles.tableAvatarText}>
                        {getInitials(item.name)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.tableCellInfo}>
                    <Text style={styles.tableName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.tableMeta} numberOfLines={1}>
                      {item.address || "No address"}
                    </Text>
                  </View>
                </View>

                <View style={[{ flex: 1 }, styles.tableCellCenter]}>
                  <Text style={styles.tablePhone} numberOfLines={1}>
                    {item.phone || "-"}
                  </Text>
                </View>

                <View style={[{ flex: 0.8 }, styles.tableCellEnd]}>
                  <View style={styles.tableActions}>
                    <Pressable
                      style={styles.tableActionBtn}
                      onPress={() =>
                        navigation.navigate("EditCompany", {
                          company: item,
                        })
                      }
                    >
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color="#38bdf8"
                      />
                    </Pressable>
                    <Pressable
                      style={styles.tableActionBtn}
                      onPress={() => deleteCompany(item.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#f87171"
                      />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            )
          }
        />

        {/* FAB */}
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={() => navigation.navigate("CreateCompany")}
        >
          <View style={styles.fabInner}>
            <Ionicons name="add" size={24} color="#fff" />
          </View>
          <View style={styles.fabGlow} />
        </Pressable>
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
    maxWidth: "70%",
  },

  toggle: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  toggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  toggleBtnActive: {
    backgroundColor: "#4f46e5",
  },

  /* SEARCH */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  input: {
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

  th: {
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

  tableCell: {
    flexDirection: "row",
    alignItems: "center",
  },

  tableCellCenter: {
    alignItems: "center",
  },

  tableCellEnd: {
    alignItems: "flex-end",
  },

  tableAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(79, 70, 229, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
    overflow: "hidden",
  },

  tableAvatarImg: {
    width: 36,
    height: 36,
  },

  tableAvatarText: {
    color: "#818cf8",
    fontSize: 12,
    fontWeight: "700",
  },

  tableCellInfo: {
    flex: 1,
  },

  tableName: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
  },

  tableMeta: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },

  tablePhone: {
    color: "#34d399",
    fontSize: 13,
    fontWeight: "600",
  },

  tableActions: {
    flexDirection: "row",
    gap: 8,
  },

  tableActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
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

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(79, 70, 229, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },

  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },

  avatarText: {
    color: "#818cf8",
    fontSize: 18,
    fontWeight: "700",
  },

  cardInfo: {
    flex: 1,
  },

  name: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },

  meta: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },

  actions: {
    gap: 8,
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  editBtn: {
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    borderColor: "rgba(56, 189, 248, 0.2)",
  },

  deleteBtn: {
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    borderColor: "rgba(248, 113, 113, 0.2)",
  },

  iconBtnPressed: {
    transform: [{ scale: 0.9 }],
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

  viewDetails: {
    color: "#818cf8",
    fontSize: 14,
    fontWeight: "700",
    marginRight: 6,
  },

  /* FAB */
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    borderRadius: 18,
    overflow: "hidden",
  },

  fabPressed: {
    transform: [{ scale: 0.95 }],
  },

  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  fabGlow: {
    position: "absolute",
    top: -4,
    left: "15%",
    right: "15%",
    height: "60%",
    backgroundColor: "#6366f1",
    opacity: 0.4,
    borderRadius: 18,
    zIndex: -1,
  },

  /* EMPTY STATE */
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 24,
  },

  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  emptyTitle: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },

  emptyMessage: {
    color: "#64748b",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: "80%",
  },

  emptyButton: {
    marginTop: 28,
    backgroundColor: "#4f46e5",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  emptyButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
