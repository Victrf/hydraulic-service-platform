import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Image,
  Animated,
} from "react-native";
import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "../../api/client";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function UsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
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

  const loadUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (err) {
      console.log(err);
      setUsers([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, []),
  );

  const deleteUser = (id: string) => {
    Alert.alert("Delete User", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/users/${id}`);
            loadUsers();
          } catch (err: any) {
            Alert.alert(
              "Delete Failed",
              err?.response?.data?.message || "Could not delete user",
            );
          }
        },
      },
    ]);
  };

  const getRoleColor = (role: string) => {
    if (role === "admin") return "#6366f1";
    if (role === "technician") return "#f59e0b";
    return "#10b981";
  };

  const getRoleBgColor = (role: string) => {
    if (role === "admin") return "rgba(99, 102, 241, 0.15)";
    if (role === "technician") return "rgba(245, 158, 11, 0.15)";
    return "rgba(16, 185, 129, 0.15)";
  };

  const getRoleBorderColor = (role: string) => {
    if (role === "admin") return "rgba(99, 102, 241, 0.3)";
    if (role === "technician") return "rgba(245, 158, 11, 0.3)";
    return "rgba(16, 185, 129, 0.3)";
  };

  const getInitials = (name?: string) => {
    if (!name) return "-";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  const normalizeUser = (item: any) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    role: item.role,
    companyId: item.companyId,
    company: item.company,
    availableEquipment: Array.isArray(item.availableEquipment)
      ? item.availableEquipment
          .map((e: any) => ({
            id: e.id || e.equipment?.id,
          }))
          .filter((e: any) => e.id)
      : [],
  });

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
            <Text style={styles.title}>Users</Text>
            <Text style={styles.subtitle}>Manage system users and roles</Text>
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
            placeholder="Search users by name or email..."
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

        {/* FILTERS */}
        <View style={styles.filters}>
          {["All", "admin", "technician", "customer"].map((r) => {
            const active = (r === "All" && !roleFilter) || roleFilter === r;
            return (
              <Pressable
                key={r}
                onPress={() => setRoleFilter(r === "All" ? null : r)}
                style={[styles.filterBtn, active && styles.filterBtnActive]}
              >
                <Text
                  style={[styles.filterText, active && styles.filterTextActive]}
                >
                  {r === "All" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
                {active && <View style={styles.filterDot} />}
              </Pressable>
            );
          })}
        </View>

        {/* STATS BAR */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{filteredUsers.length}</Text>
            <Text style={styles.statLabel}>Showing</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* CREATE BUTTON */}
        <Pressable
          style={({ pressed }) => [
            styles.createBtn,
            pressed && styles.createBtnPressed,
          ]}
          onPress={() => navigation.navigate("CreateUser")}
        >
          <View style={styles.createBtnInner}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.createBtnText}>Create User</Text>
          </View>
        </Pressable>

        {/* TABLE HEADER */}
        {viewMode === "table" && (
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>User</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "center" }]}>
              Role
            </Text>
            <Text style={[styles.th, { flex: 0.8, textAlign: "center" }]}>
              Co
            </Text>
            <Text style={[styles.th, { flex: 0.6, textAlign: "center" }]}>
              Eq
            </Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: "right" }]}>
              Actions
            </Text>
          </View>
        )}

        <FlatList
          data={filteredUsers}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={() => {
            if (users.length === 0) {
              return (
                <EmptyState
                  icon="people-outline"
                  title="No Users Yet"
                  message="Create your first user to start assigning roles and equipment."
                  buttonText="Create User"
                  onPress={() => navigation.navigate("CreateUser")}
                />
              );
            }
            return (
              <EmptyState
                icon="search-outline"
                title="No Results Found"
                message="Try a different name, email or filter."
              />
            );
          }}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) =>
            viewMode === "card" ? (
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
                onPress={() =>
                  navigation.navigate("UserDetails", {
                    userId: item.id,
                  })
                }
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardLeft}>
                    {item.profileImage ? (
                      <Image
                        source={{
                          uri: `${api.defaults.baseURL}/uploads/users/${item.profileImage}`,
                        }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {item.name?.charAt(0)?.toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <View style={styles.userInfo}>
                      <Text style={styles.name} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.email} numberOfLines={1}>
                        {item.email}
                      </Text>
                      <View style={styles.metaRow}>
                        <Ionicons
                          name="business-outline"
                          size={12}
                          color="#64748b"
                        />
                        <Text style={styles.company} numberOfLines={1}>
                          {item.company?.name || "No Company"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardRight}>
                    <View
                      style={[
                        styles.roleBadge,
                        {
                          backgroundColor: getRoleBgColor(item.role),
                          borderColor: getRoleBorderColor(item.role),
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.roleDot,
                          { backgroundColor: getRoleColor(item.role) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.roleText,
                          { color: getRoleColor(item.role) },
                        ]}
                      >
                        {item.role}
                      </Text>
                    </View>
                    <View style={styles.equipmentBadge}>
                      <Ionicons
                        name="hardware-chip-outline"
                        size={12}
                        color="#64748b"
                      />
                      <Text style={styles.equipmentCount}>
                        {item.availableEquipment?.length || 0}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardActions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.assignBtn,
                      pressed && styles.actionBtnPressed,
                    ]}
                    onPress={() =>
                      navigation.navigate("AssignEquipment", {
                        user: normalizeUser(item),
                      })
                    }
                  >
                    <Ionicons name="link-outline" size={14} color="#818cf8" />
                    <Text style={styles.actionBtnText}>Assign</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.editBtn,
                      pressed && styles.actionBtnPressed,
                    ]}
                    onPress={() =>
                      navigation.navigate("EditUser", { user: item })
                    }
                  >
                    <Ionicons name="create-outline" size={14} color="#38bdf8" />
                    <Text style={[styles.actionBtnText, { color: "#38bdf8" }]}>
                      Edit
                    </Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.deleteBtn,
                      pressed && styles.actionBtnPressed,
                    ]}
                    onPress={() => deleteUser(item.id)}
                  >
                    <Ionicons name="trash-outline" size={14} color="#f87171" />
                    <Text style={[styles.actionBtnText, { color: "#f87171" }]}>
                      Delete
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.tableRow,
                  pressed && styles.tableRowPressed,
                ]}
                onPress={() =>
                  navigation.navigate("UserDetails", {
                    userId: item.id,
                  })
                }
              >
                <View style={[{ flex: 2 }, styles.tableCell]}>
                  <View style={styles.tableAvatar}>
                    {item.profileImage ? (
                      <Image
                        source={{
                          uri: `${api.defaults.baseURL}/uploads/users/${item.profileImage}`,
                        }}
                        style={styles.tableAvatarImg}
                      />
                    ) : (
                      <Text style={styles.tableAvatarText}>
                        {item.name?.charAt(0)?.toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View style={styles.tableCellInfo}>
                    <Text style={styles.tableName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.tableEmail} numberOfLines={1}>
                      {item.email}
                    </Text>
                  </View>
                </View>

                <View style={[{ flex: 1 }, styles.tableCellCenter]}>
                  <View
                    style={[
                      styles.tableRoleBadge,
                      {
                        backgroundColor: getRoleBgColor(item.role),
                        borderColor: getRoleBorderColor(item.role),
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.roleDot,
                        { backgroundColor: getRoleColor(item.role) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.tableRoleText,
                        { color: getRoleColor(item.role) },
                      ]}
                    >
                      {item.role}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.tableCompany, { flex: 0.8 }]}>
                  {getInitials(item.company?.name)}
                </Text>

                <Text style={[styles.tableEqCount, { flex: 0.6 }]}>
                  {item.availableEquipment?.length || 0}
                </Text>

                <View style={[{ flex: 1.2 }, styles.tableCellEnd]}>
                  <View style={styles.tableActions}>
                    <Pressable
                      style={styles.tableActionBtn}
                      onPress={() =>
                        navigation.navigate("AssignEquipment", {
                          user: normalizeUser(item),
                        })
                      }
                    >
                      <Ionicons name="link-outline" size={16} color="#818cf8" />
                    </Pressable>
                    <Pressable
                      style={styles.tableActionBtn}
                      onPress={() =>
                        navigation.navigate("EditUser", { user: item })
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
                      onPress={() => deleteUser(item.id)}
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
    marginBottom: 14,
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

  /* FILTERS */
  filters: {
    flexDirection: "row",
    marginBottom: 14,
    gap: 8,
  },

  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
  },

  filterBtnActive: {
    backgroundColor: "rgba(79, 70, 229, 0.15)",
    borderColor: "rgba(99, 102, 241, 0.3)",
  },

  filterText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
  },

  filterTextActive: {
    color: "#e2e8f0",
    fontWeight: "700",
  },

  filterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#6366f1",
    marginTop: 4,
  },

  /* STATS */
  statsBar: {
    flexDirection: "row",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    color: "#f8fafc",
    fontSize: 18,
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

  /* CREATE BUTTON */
  createBtn: {
    marginBottom: 16,
    borderRadius: 18,
    overflow: "hidden",
  },

  createBtnPressed: {
    transform: [{ scale: 0.98 }],
  },

  createBtnInner: {
    backgroundColor: "#4f46e5",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 8,
  },

  createBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
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
    fontSize: 14,
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

  tableEmail: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 1,
  },

  tableRoleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "center",
  },

  tableRoleText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
    marginLeft: 4,
  },

  tableCompany: {
    color: "#60a5fa",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },

  tableEqCount: {
    color: "#34d399",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },

  tableActions: {
    flexDirection: "row",
    gap: 6,
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
    overflow: "hidden",
  },

  avatarText: {
    color: "#818cf8",
    fontSize: 20,
    fontWeight: "700",
  },

  userInfo: {
    flex: 1,
  },

  name: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },

  email: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 6,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  company: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },

  cardRight: {
    alignItems: "flex-end",
    gap: 8,
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },

  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  roleText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  equipmentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  equipmentCount: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginVertical: 14,
  },

  cardActions: {
    flexDirection: "row",
    gap: 8,
  },

  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
  },

  actionBtnPressed: {
    transform: [{ scale: 0.95 }],
  },

  assignBtn: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderColor: "rgba(99, 102, 241, 0.2)",
  },

  editBtn: {
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    borderColor: "rgba(56, 189, 248, 0.2)",
  },

  deleteBtn: {
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    borderColor: "rgba(248, 113, 113, 0.2)",
  },

  actionBtnText: {
    fontSize: 13,
    fontWeight: "700",
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
