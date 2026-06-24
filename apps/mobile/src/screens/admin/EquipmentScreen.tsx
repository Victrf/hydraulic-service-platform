import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert, // ✅ NEW
} from "react-native";
import { useState, useCallback, useEffect } from "react";
import { api } from "../../api/client";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function EquipmentScreen() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  const navigation = useNavigation<any>();

  const loadEquipment = async () => {
    try {
      const res = await api.get("/equipment");
      setEquipment(res.data || []);
    } catch (err) {
      console.log("EQUIPMENT LOAD ERROR:", err);
      setEquipment([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEquipment();
    }, [])
  );

  // ✅ DELETE FUNCTION
  const deleteEquipment = (id: string) => {
    Alert.alert(
      "Delete Equipment",
      "Are you sure you want to delete this equipment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/equipment/${id}`);
              loadEquipment(); // refresh
            } catch (err) {
              console.log("DELETE ERROR:", err);
            }
          },
        },
      ]
    );
  };

  // GROUP BY COMPANY
  const grouped = equipment.reduce((acc: any, item: any) => {
    const companyName = item.company?.name || "Unassigned";

    if (!acc[companyName]) {
      acc[companyName] = [];
    }

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
    setExpanded((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Equipment</Text>
          <Text style={styles.subtitle}>
            Manage company equipment
          </Text>
        </View>

        <View style={styles.iconToggle}>
          <Pressable onPress={() => setViewMode("card")}>
            <Ionicons
              name="grid-outline"
              size={22}
              color={viewMode === "card" ? "#7c3aed" : "#6b7280"}
            />
          </Pressable>

          <Pressable onPress={() => setViewMode("table")}>
            <Ionicons
              name="list-outline"
              size={22}
              color={viewMode === "table" ? "#7c3aed" : "#6b7280"}
            />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={groupedArray}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => {
          const [companyName, items] = item as any;
          const isOpen = expanded[companyName];

          return (
            <View style={{ marginBottom: 20 }}>
              <Pressable onPress={() => toggleCompany(companyName)}>
                <Text style={styles.companyHeader}>
                  {companyName} ({items.length})
                </Text>
              </Pressable>

              {isOpen &&
                (viewMode === "card" ? (
                  items.map((eq: any) => (
                    <View key={eq.id} style={styles.card}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.name}>{eq.name}</Text>
                        <Text style={styles.meta}>
                          Serial: {eq.serialNumber}
                        </Text>
                        <Text style={styles.meta}>
                          Brand: {eq.brand || "-"}
                        </Text>
                      </View>

                      {/* ACTIONS */}
                      <View style={styles.actions}>
                        <Pressable
                          onPress={() =>
                            navigation.navigate("EditEquipment", {
                              equipment: eq,
                            })
                          }
                        >
                          <Text style={styles.edit}>Edit</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => deleteEquipment(eq.id)}
                        >
                          <Text style={styles.delete}>Delete</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))
                ) : (
                  <View>
                    {/* TABLE HEADER */}
                    <View style={styles.tableHeader}>
                      <Text style={styles.th}>Name</Text>
                      <Text style={styles.th}>Serial</Text>
                      <Text style={styles.th}>Brand</Text>
                      <Text style={styles.th}>Actions</Text>
                    </View>

                    {/* TABLE ROWS */}
                    {items.map((eq: any) => (
                      <View key={eq.id} style={styles.tableRow}>
                        <Text style={styles.td}>{eq.name}</Text>
                        <Text style={styles.td}>
                          {eq.serialNumber}
                        </Text>
                        <Text style={styles.td}>
                          {eq.brand || "-"}
                        </Text>

                        <View style={styles.tableActions}>
                          <Pressable
                            onPress={() =>
                              navigation.navigate("EditEquipment", {
                                equipment: eq,
                              })
                            }
                          >
                            <Text style={styles.edit}>Edit</Text>
                          </Pressable>

                          <Pressable
                            onPress={() => deleteEquipment(eq.id)}
                          >
                            <Text style={styles.delete}>Del</Text>
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
            </View>
          );
        }}
      />

      <Pressable
        style={styles.createBtn}
        onPress={() => navigation.navigate("CreateEquipment")}
      >
        <Text style={styles.createText}>+ Add Equipment</Text>
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

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  iconToggle: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: "#0f172a",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },

  subtitle: {
    color: "#6b7280",
    marginTop: 4,
    fontSize: 12,
  },

  companyHeader: {
    color: "#7c3aed",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },

  card: {
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  actions: {
    gap: 10,
    alignItems: "flex-end",
  },

  name: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  meta: {
    color: "#9ca3af",
    fontSize: 12,
  },

  edit: {
    color: "#7c3aed",
    fontWeight: "600",
    fontSize: 12,
  },

  delete: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 12,
  },

  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#1e293b",
    paddingBottom: 6,
    marginBottom: 6,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
  },

  th: {
    flex: 1,
    color: "#7c3aed",
    fontSize: 12,
  },

  td: {
    flex: 1,
    color: "#9ca3af",
    fontSize: 12,
  },

  tableActions: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },

  createBtn: {
    backgroundColor: "#7c3aed",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  createText: {
    color: "#fff",
    fontWeight: "600",
  },
});