import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { api } from "../../api/client";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function EditUserScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { user } = route.params;

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [password, setPassword] = useState("");

  const [companyId, setCompanyId] = useState(user.companyId);
  const [companies, setCompanies] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false); // ✅ NEW

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const res = await api.get("/companies");
      setCompanies(res.data || []);
    } catch (err) {
      console.log("COMPANY LOAD ERROR:", err);
    }
  };

  const updateUser = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Name and Email are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.patch(`/users/${user.id}`, {
        name,
        email,
        role,
        companyId,
        password: password || undefined,
      });

      Alert.alert("Success", "User updated");
      navigation.goBack();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to update user"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit User</Text>
      <Text style={styles.subtitle}>Update user details</Text>

      {/* BASIC INFO */}
      <View style={styles.card}>
        <TextInput
          placeholder="Name"
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
          placeholder="New Password (optional)"
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* ROLE */}
      <View style={styles.card}>
        <Text style={styles.section}>Role</Text>

        {["admin", "technician", "customer"].map((r) => (
          <Pressable
            key={r}
            style={[
              styles.roleBtn,
              role === r && styles.activeRole,
            ]}
            onPress={() => setRole(r)}
          >
            <Text style={{ color: role === r ? "#fff" : "#9ca3af" }}>
              {r}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* COMPANY (CUSTOM DROPDOWN) */}
      <View style={styles.card}>
        <Text style={styles.section}>Company</Text>

        <Pressable
          style={styles.selector}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ color: "#fff" }}>
            {
              companies.find((c) => c.id === companyId)?.name ||
              "Select company"
            }
          </Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      {/* SUBMIT */}
      <Pressable style={styles.btn} onPress={updateUser}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Update User</Text>
        )}
      </Pressable>

      {/* MODAL */}
      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Company</Text>

            <ScrollView>
              {companies.map((c) => (
                <Pressable
                  key={c.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setCompanyId(c.id);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalText}>{c.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "#fff" }}>Close</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },

  container: {
    padding: 20,
    paddingTop: 60,
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },

  subtitle: {
    color: "#6b7280",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },

  input: {
    backgroundColor: "#020617",
    color: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  section: {
    color: "#7c3aed",
    marginBottom: 10,
  },

  roleBtn: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 6,
  },

  activeRole: {
    backgroundColor: "#7c3aed",
  },

  selector: {
    backgroundColor: "#020617",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  btn: {
    backgroundColor: "#7c3aed",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
  },

  error: {
    color: "#ef4444",
    marginTop: 6,
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 16,
    maxHeight: "70%",
  },

  modalTitle: {
    color: "#fff",
    marginBottom: 10,
  },

  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#1e293b",
  },

  modalText: {
    color: "#9ca3af",
  },

  closeBtn: {
    marginTop: 10,
    backgroundColor: "#7c3aed",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});