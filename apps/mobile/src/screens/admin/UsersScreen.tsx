import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useState, useCallback } from "react";
import { api } from "../../api/client";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function UsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "table">("table");

  const navigation = useNavigation<any>();

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
    Alert.alert("Delete User", "Are you sure?", [
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
    if (role === "admin") return "#7c3aed";
    if (role === "technician") return "#f59e0b";
    return "#10b981";
  };

  // ✅ NEW: initials for company
  const getInitials = (name?: string) => {
    if (!name) return "-";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();
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

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Users</Text>
          <Text style={styles.subtitle}>Manage system users and roles</Text>
        </View>

        <View style={styles.toggle}>
          <Pressable onPress={() => setViewMode("card")}>
            <Ionicons
              name="grid-outline"
              size={20}
              color={viewMode === "card" ? "#7c3aed" : "#6b7280"}
            />
          </Pressable>

          <Pressable onPress={() => setViewMode("table")}>
            <Ionicons
              name="list-outline"
              size={20}
              color={viewMode === "table" ? "#7c3aed" : "#6b7280"}
            />
          </Pressable>
        </View>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#9ca3af" />
        <TextInput
          placeholder="Search users..."
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* FILTER */}
      <View style={styles.filters}>
        {["All", "admin", "technician", "customer"].map((r) => {
          const active = (r === "All" && !roleFilter) || roleFilter === r;

          return (
            <Pressable
              key={r}
              onPress={() => setRoleFilter(r === "All" ? null : r)}
              style={[styles.filterBtn, active && styles.activeFilter]}
            >
              <Text style={{ color: active ? "#fff" : "#9ca3af" }}>{r}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* CREATE */}
      <Pressable
        style={styles.createBtn}
        onPress={() => navigation.navigate("CreateUser")}
      >
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={{ color: "#fff" }}>Create User</Text>
      </Pressable>

      {/* TABLE HEADER */}
      {viewMode === "table" && (
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 2.2 }]}>Name</Text>
          <Text style={[styles.th, { flex: 1 }]}>Role</Text>
          <Text style={[styles.th, { flex: 1, textAlign: "center" }]}>Co</Text>
          <Text style={[styles.th, { flex: 0.8, textAlign: "center" }]}>
            Eq
          </Text>
          <Text style={[styles.th, { flex: 1.5, textAlign: "right" }]}>⋯</Text>
        </View>
      )}

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) =>
          viewMode === "card" ? (
            <Pressable
              style={styles.card}
              onPress={() =>
                navigation.navigate("UserDetails", {
                  userId: item.id,
                })
              }
            >
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.email}>{item.email}</Text>

                  <Text style={styles.company}>
                    {item.company?.name || "No Company Assigned"}
                  </Text>

                  <View style={styles.metaRow}>
                    <View
                      style={[
                        styles.roleBadge,
                        { backgroundColor: getRoleColor(item.role) },
                      ]}
                    >
                      <Text style={styles.roleText}>{item.role}</Text>
                    </View>

                    <Text style={styles.equipmentText}>
                      {item.availableEquipment?.length || 0} equipment
                    </Text>
                  </View>
                </View>

                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.name?.charAt(0)?.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() =>
                    navigation.navigate("AssignEquipment", {
                      user: normalizeUser(item),
                    })
                  }
                >
                  <Text style={{ color: "#d1d5db" }}>Assign</Text>
                </Pressable>

                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() =>
                    navigation.navigate("EditUser", { user: item })
                  }
                >
                  <Text style={{ color: "#d1d5db" }}>Edit</Text>
                </Pressable>

                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() => deleteUser(item.id)}
                >
                  <Text style={{ color: "#ef4444" }}>Delete</Text>
                </Pressable>
              </View>
            </Pressable>
          ) : (
            <Pressable
              style={styles.tableRow}
              onPress={() =>
                navigation.navigate("UserDetails", {
                  userId: item.id,
                })
              }
            >
              <Text
                style={[styles.td, styles.nameCell]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.name}
              </Text>

              <View style={{ flex: 1 }}>
                <View
                  style={[
                    styles.roleBadge,
                    { backgroundColor: getRoleColor(item.role) },
                  ]}
                >
                  <Text style={styles.roleText}>{item.role}</Text>
                </View>
              </View>

              <Text style={styles.companyShort}>
                {getInitials(item.company?.name)}
              </Text>

              <Text style={styles.equipmentCount}>
                {item.availableEquipment?.length || 0}
              </Text>

              <View style={styles.actionIcons}>
                <Pressable
                  onPress={() =>
                    navigation.navigate("AssignEquipment", {
                      user: normalizeUser(item),
                    })
                  }
                >
                  <Ionicons
                    name="hardware-chip-outline"
                    size={18}
                    color="#7c3aed"
                  />
                </Pressable>

                <Pressable
                  onPress={() =>
                    navigation.navigate("EditUser", { user: item })
                  }
                >
                  <Ionicons name="create-outline" size={18} color="#38bdf8" />
                </Pressable>

                <Pressable onPress={() => deleteUser(item.id)}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </Pressable>
              </View>
            </Pressable>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 16,
    paddingTop: 40,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  toggle: {
    flexDirection: "row",
    gap: 12,
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    color: "#9ca3af",
    marginTop: 4,
  },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#111827",
    padding: 10,
    borderRadius: 12,
    marginVertical: 12,
    gap: 8,
  },

  input: { color: "#fff", flex: 1 },

  filters: {
    flexDirection: "row",
    marginBottom: 12,
  },

  filterBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#111827",
    marginRight: 8,
  },

  activeFilter: {
    backgroundColor: "#7c3aed",
  },

  createBtn: {
    backgroundColor: "#7c3aed",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },

  tableHeader: {
    flexDirection: "row",
    marginBottom: 6,
  },

  th: {
    color: "#9ca3af",
    fontSize: 12,
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#1f2937",
  },

  td: {
    color: "#fff",
    fontSize: 13,
  },

  nameCell: {
    flex: 2.2,
    fontWeight: "600",
  },

  companyShort: {
    flex: 1,
    color: "#60a5fa",
    fontWeight: "700",
    textAlign: "center",
  },

  equipmentCount: {
    flex: 0.8,
    color: "#34d399",
    fontWeight: "800",
    textAlign: "center",
    fontSize: 14,
  },

  actionIcons: {
    flex: 1.5,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },

  card: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },

  avatarText: {
    color: "#fff",
    fontWeight: "700",
  },

  name: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  email: {
    color: "#9ca3af",
    marginTop: 2,
  },

  company: {
    color: "#6b7280",
    marginTop: 4,
    fontSize: 12,
  },

  actions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },

  secondaryBtn: {
    backgroundColor: "#1f2937",
    padding: 8,
    borderRadius: 10,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 10,
  },

  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  roleText: {
    color: "#fff",
    fontSize: 10,
    textTransform: "capitalize",
  },

  equipmentText: {
    color: "#6b7280",
    fontSize: 11,
  },
});
