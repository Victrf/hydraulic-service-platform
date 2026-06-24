import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useNavigation } from "@react-navigation/native";

export default function CreateUserScreen() {
  const navigation = useNavigation<any>();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "technician" | "customer">(
    "customer",
  );

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);

  const [equipment, setEquipment] = useState<any[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (!companyId) {
      setEquipment([]);
      setSelectedEquipment([]);
      return;
    }
    loadEquipment(companyId);
  }, [companyId]);

  const loadCompanies = async () => {
    try {
      const res = await api.get("/companies");
      setCompanies(res.data || []);
    } catch (err) {
      console.log("COMPANY LOAD ERROR:", err);
    }
  };

  const loadEquipment = async (companyId: string) => {
    try {
      const res = await api.get("/equipment");

      const filtered = (res.data || []).filter(
        (e: any) => e.companyId === companyId,
      );

      setEquipment(filtered);
      setSelectedEquipment([]);
    } catch (err) {
      console.log("EQUIPMENT LOAD ERROR:", err);
    }
  };

  const toggleEquipment = (id: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(id)
        ? prev.filter((e) => e !== id)
        : [...prev, id],
    );
  };

  // ✅ FIXED CREATE USER
  const createUser = async () => {
    try {
      // 🔒 BASIC VALIDATION
      if (!name || !email || !password) {
        return Alert.alert("Missing fields", "Fill all required fields");
      }

      // 🔒 PREVENT INVALID COMBO
      if (!companyId && selectedEquipment.length > 0) {
        return Alert.alert(
          "Invalid selection",
          "Select a company before assigning equipment",
        );
      }

      const payload: any = {
        name,
        email,
        password,
        role,
      };

      // ✅ ONLY ADD IF EXISTS
      if (companyId) payload.companyId = companyId;

      if (selectedEquipment.length > 0) {
        payload.equipmentIds = selectedEquipment;
      }

      console.log("CREATE USER PAYLOAD:", payload);

      await api.post("/users", payload);

      Alert.alert("Success", "User created successfully");
      navigation.goBack();
    } catch (err: any) {
      console.log(
        "CREATE USER ERROR:",
        err?.response?.data || err
      );

      Alert.alert(
        "Create Failed",
        err?.response?.data?.message ||
          "User creation failed"
      );
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Create User</Text>
        <Text style={styles.subtitle}>
          Add a new user and assign role
        </Text>
      </View>

      {/* USER INFO */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>User Info</Text>

        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#6b7280"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* ROLE */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Role</Text>

        <View style={styles.roleRow}>
          {["admin", "technician", "customer"].map((r) => {
            const active = role === r;

            return (
              <Pressable
                key={r}
                onPress={() => setRole(r as any)}
                style={[
                  styles.roleBtn,
                  active && styles.activeRoleBtn,
                ]}
              >
                <Text style={{ color: active ? "#fff" : "#9ca3af" }}>
                  {r}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* COMPANY */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Assign Company (Optional)
        </Text>

        {companies.length === 0 ? (
          <Text style={styles.emptyText}>
            No companies available
          </Text>
        ) : (
          companies.map((c) => {
            const active = companyId === c.id;

            return (
              <Pressable
                key={c.id}
                onPress={() => setCompanyId(c.id)}
                style={[
                  styles.companyItem,
                  active && styles.activeCompany,
                ]}
              >
                <Text style={{ color: active ? "#fff" : "#9ca3af" }}>
                  {c.name}
                </Text>
              </Pressable>
            );
          })
        )}
      </View>

      {/* EQUIPMENT */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Assign Equipment
        </Text>

        {!companyId ? (
          <Text style={styles.emptyText}>
            Select a company first
          </Text>
        ) : equipment.length === 0 ? (
          <Text style={styles.emptyText}>
            No equipment available
          </Text>
        ) : (
          equipment.map((e) => {
            const active = selectedEquipment.includes(e.id);

            return (
              <Pressable
                key={e.id}
                onPress={() => toggleEquipment(e.id)}
                style={[
                  styles.companyItem,
                  active && styles.activeCompany,
                ]}
              >
                <Text style={{ color: active ? "#fff" : "#9ca3af" }}>
                  {e.name}
                </Text>
              </Pressable>
            );
          })
        )}
      </View>

      {/* BUTTON */}
      <Pressable style={styles.createBtn} onPress={createUser}>
        <Text style={styles.createText}>Create User</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  container: { padding: 16, paddingTop: 60 },

  header: { marginBottom: 20 },
  title: { color: "#fff", fontSize: 24, fontWeight: "700" },
  subtitle: { color: "#9ca3af" },

  card: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },

  sectionTitle: { color: "#9ca3af", marginBottom: 10 },

  input: {
    backgroundColor: "#020617",
    color: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  roleRow: { flexDirection: "row", gap: 8 },

  roleBtn: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#020617",
  },

  activeRoleBtn: {
    backgroundColor: "#7c3aed",
  },

  companyItem: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#020617",
    marginBottom: 8,
  },

  activeCompany: {
    backgroundColor: "#7c3aed",
  },

  emptyText: {
    color: "#6b7280",
  },

  createBtn: {
    backgroundColor: "#7c3aed",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  createText: {
    color: "#fff",
    fontWeight: "600",
  },
});