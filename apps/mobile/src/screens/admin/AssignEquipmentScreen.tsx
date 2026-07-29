import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useCallback } from "react";
import { api } from "../../api/client";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import SuccessModal from "../../components/common/SuccessModal";

export default function AssignEquipmentScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [successVisible, setSuccessVisible] = useState(false);

  const { user } = route.params;

  const [equipment, setEquipment] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/equipment");

      const equipmentList = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      // ✅ STEP 1: get assigned IDs
      const assignedIds = user.availableEquipment?.map((e: any) => e.id) || [];

      // ✅ STEP 2: filter by company
      const filtered = equipmentList.filter(
        (e: any) => e.companyId === user.companyId,
      );

      // ✅ STEP 3: include assigned equipment (even if not in filtered)
      const assignedEquipment = equipmentList.filter((e: any) =>
        assignedIds.includes(e.id),
      );

      // ✅ STEP 4: merge without duplicates
      const merged = [
        ...assignedEquipment,
        ...filtered.filter((e: any) => !assignedIds.includes(e.id)),
      ];

      setEquipment(merged);

      // ✅ STEP 5: pre-select assigned
      setSelected(assignedIds);
    } catch (err: any) {
      console.log("LOAD ERROR:", err?.response?.data || err.message);
      Alert.alert("Error", "Failed to load equipment");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected((prev) => prev.filter((x) => x !== id));
    } else {
      setSelected((prev) => [...prev, id]);
    }
  };

  const save = async () => {
    try {
      setSaving(true);

      await api.patch(`/users/${user.id}/equipment`, {
        equipmentIds: selected,
      });

      setSuccessVisible(true);
    } catch (err: any) {
      console.log("SAVE ERROR:", err?.response?.data || err.message);

      Alert.alert(
        "Save failed",
        err?.response?.data?.message || "Check backend route",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Assign Equipment</Text>
        <Text style={styles.subtitle}>
          {user?.name} • {user?.company?.name || "No Company"}
        </Text>
      </View>

      {equipment.length > 0 && (
        <Pressable
          style={styles.addEquipmentBtn}
          onPress={() =>
            navigation.navigate("CreateEquipment", {
              companyId: user.companyId,
              companyName: user.company?.name,
              lockCompany: !!user.companyId,
              returnTo: "AssignEquipment",
              user,
            })
          }
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" />

          <Text style={styles.addEquipmentText}>Add Equipment</Text>
        </Pressable>
      )}

      {equipment.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={70} color="#475569" />

          <Text style={styles.emptyTitle}>No Equipment Found</Text>

          <Text style={styles.emptyDescription}>
            {user.company?.name || "This company"} doesn't have any equipment
            yet. Create equipment first, then assign it to this user.
          </Text>

          <Pressable
            style={styles.createEquipmentBtn}
            onPress={() =>
              navigation.navigate("CreateEquipment", {
                companyId: user.companyId,
                companyName: user.company?.name,
                lockCompany: !!user.companyId,
                returnTo: "AssignEquipment",
                user,
              })
            }
          >
            <Ionicons name="add-circle-outline" size={18} color="#fff" />

            <Text style={styles.createEquipmentText}>Create Equipment</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={equipment}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = selected.includes(item.id);

            return (
              <Pressable
                onPress={() => toggleSelect(item.id)}
                style={[styles.item, isSelected && styles.selectedItem]}
              >
                <View>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>
                    {item.brand} • {item.model}
                  </Text>
                  <Text style={styles.meta}>SN: {item.serialNumber}</Text>
                </View>

                <Ionicons
                  name={isSelected ? "checkbox" : "square-outline"}
                  size={22}
                  color={isSelected ? "#7c3aed" : "#6b7280"}
                />
              </Pressable>
            );
          }}
        />
      )}

      <Pressable
        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        onPress={save}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Save Assignment</Text>
        )}
      </Pressable>
      <SuccessModal
        visible={successVisible}
        title="Equipment Assigned"
        message="The equipment assignments have been updated successfully."
        buttonText="Continue"
        onContinue={() => {
          setSuccessVisible(false);
          navigation.goBack();
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

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    color: "#9ca3af",
    marginTop: 4,
  },

  item: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  selectedItem: {
    borderColor: "#7c3aed",
    backgroundColor: "#1e1b4b",
  },

  name: {
    color: "#fff",
    fontWeight: "600",
  },

  meta: {
    color: "#9ca3af",
    fontSize: 12,
  },

  saveBtn: {
    backgroundColor: "#7c3aed",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    color: "#6b7280",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
  },

  emptyDescription: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
    fontSize: 15,
  },

  createEquipmentBtn: {
    marginTop: 28,
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  createEquipmentText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  addEquipmentBtn: {
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },

  addEquipmentText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
