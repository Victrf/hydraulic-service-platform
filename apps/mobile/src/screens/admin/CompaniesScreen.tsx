import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { useState, useCallback } from "react";
import { api } from "../../api/client";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function CompaniesScreen() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  const navigation = useNavigation<any>();

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
    Alert.alert("Delete Company", "Are you sure?", [
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
              err?.response?.data?.message || "Could not delete",
            );
          }
        },
      },
    ]);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const filtered = companies.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Companies</Text>
          <Text style={styles.subtitle}>Manage your companies</Text>
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
          placeholder="Search companies..."
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* TABLE HEADER */}
      {viewMode === "table" && (
        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.colName]}>Name</Text>
          <Text style={[styles.th, styles.colCo]}>Co</Text>
          <Text style={[styles.th, styles.colPhone]}>Phone</Text>
          <Text style={[styles.th, styles.colAction]}>⋯</Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) =>
          viewMode === "card" ? (
            <Pressable
              style={styles.card}
              onPress={() =>
                navigation.navigate("CompanyDetails", {
                  companyId: item.id,
                })
              }
            >
              <View style={styles.left}>
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

                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>
                    {item.address || "No address"}
                  </Text>
                  <Text style={styles.meta}>{item.phone || "No phone"}</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <Pressable
                  style={styles.iconBtn}
                  onPress={() =>
                    navigation.navigate("EditCompany", {
                      company: item,
                    })
                  }
                >
                  <Ionicons name="create-outline" size={18} color="#38bdf8" />
                </Pressable>

                <Pressable
                  style={styles.iconBtn}
                  onPress={() => deleteCompany(item.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </Pressable>
              </View>
            </Pressable>
          ) : (
            <View style={styles.tableRow}>
              {/* NAME */}
              <Text
                style={[styles.td, styles.colName]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.name}
              </Text>

              {/* COMPANY */}
              <Text style={styles.colCo}>{getInitials(item.name)}</Text>

              {/* PHONE */}
              <Text
                style={styles.colPhone}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.phone || "-"}
              </Text>

              {/* ACTIONS */}
              <View style={styles.colAction}>
                <View style={styles.actionIcons}>
                  <Pressable
                    onPress={() =>
                      navigation.navigate("EditCompany", {
                        company: item,
                      })
                    }
                  >
                    <Ionicons name="create-outline" size={18} color="#38bdf8" />
                  </Pressable>

                  <Pressable onPress={() => deleteCompany(item.id)}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </Pressable>
                </View>
              </View>
            </View>
          )
        }
      />

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate("CreateCompany")}
      >
        <Ionicons name="add" size={22} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 16,
    paddingTop: 60,
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },

  subtitle: {
    color: "#6b7280",
    marginBottom: 20,
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

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#111827",
    padding: 10,
    borderRadius: 12,
    marginVertical: 12,
    gap: 8,
  },

  input: {
    color: "#fff",
    flex: 1,
  },

  tableHeader: {
    flexDirection: "row",
    marginBottom: 6,
  },

  th: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "600",
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

  colName: {
    flex: 2.2,
    fontWeight: "600",
  },

  colCo: {
    flex: 0.8,
    color: "#60a5fa",
    textAlign: "center",
    fontWeight: "700",
  },

  colPhone: {
    flex: 1.2,
    color: "#34d399",
    textAlign: "center",
  },

  colAction: {
    flex: 1.5,
    alignItems: "flex-end",
  },

  actionIcons: {
    flexDirection: "row",
    gap: 12,
  },

  card: {
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },

  avatarText: {
    color: "#7c3aed",
    fontWeight: "700",
  },

  name: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  meta: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },

  actions: {
    gap: 10,
  },

  iconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#020617",
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#7c3aed",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});
