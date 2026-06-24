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
import { useNavigation } from "@react-navigation/native";

export default function CreateEquipmentScreen() {
  const navigation = useNavigation<any>();

  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");

  const [installationDate, setInstallationDate] = useState("");
  const [warrantyExpiry, setWarrantyExpiry] = useState("");

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);

  const [modalVisible, setModalVisible] = useState(false); // ✅ NEW

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const res = await api.get("/companies");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setCompanies(data);
    } catch (err: any) {
      console.log("COMPANY LOAD ERROR:", err?.response?.data || err.message);
      setCompanies([]);
    }
  };

  const createEquipment = async () => {
    if (!name.trim() || !serialNumber.trim()) {
      setError("Name and Serial Number are required");
      return;
    }

    if (!companyId) {
      setError("Select a company");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/equipment", {
        name: name.trim(),
        serialNumber: serialNumber.trim(),
        brand: brand.trim(),
        model: model.trim(),
        companyId,
        installationDate: installationDate
          ? new Date(installationDate).toISOString()
          : undefined,
        warrantyExpiry: warrantyExpiry
          ? new Date(warrantyExpiry).toISOString()
          : undefined,
      });

      Alert.alert("Success", "Equipment created");

      setName("");
      setSerialNumber("");
      setBrand("");
      setModel("");
      setInstallationDate("");
      setWarrantyExpiry("");
      setCompanyId(null);

      navigation.goBack();
    } catch (err: any) {
      console.log("CREATE EQUIPMENT ERROR:", err?.response?.data || err.message);

      if (err?.response?.data?.message?.includes("serialNumber")) {
        setError("Serial number already exists");
      } else {
        setError(
          err?.response?.data?.message || "Failed to create equipment"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.topAccent} />
        <Text style={styles.title}>Create Equipment</Text>
        <Text style={styles.subtitle}>
          Add equipment and attach it to a company
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Equipment Info</Text>

        <TextInput
          placeholder="Equipment Name *"
          placeholderTextColor="#6b7280"
          style={[styles.input, focused === "name" && styles.inputActive]}
          value={name}
          onFocus={() => setFocused("name")}
          onBlur={() => setFocused(null)}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Serial Number *"
          placeholderTextColor="#6b7280"
          style={[styles.input, focused === "serial" && styles.inputActive]}
          value={serialNumber}
          onFocus={() => setFocused("serial")}
          onBlur={() => setFocused(null)}
          onChangeText={setSerialNumber}
        />

        <TextInput
          placeholder="Brand"
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={brand}
          onChangeText={setBrand}
        />

        <TextInput
          placeholder="Model"
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={model}
          onChangeText={setModel}
        />

        <TextInput
          placeholder="Installation Date (YYYY-MM-DD)"
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={installationDate}
          onChangeText={setInstallationDate}
        />

        <TextInput
          placeholder="Warranty Expiry (YYYY-MM-DD)"
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={warrantyExpiry}
          onChangeText={setWarrantyExpiry}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Assign Company *</Text>

        {companies.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.empty}>No companies available</Text>

            <Pressable
              onPress={() => navigation.navigate("CreateCompany")}
              style={styles.linkBtn}
            >
              <Text style={styles.linkText}>+ Create Company</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.selector}
            onPress={() => setModalVisible(true)}
          >
            <Text style={{ color: companyId ? "#fff" : "#6b7280" }}>
              {companyId
                ? companies.find((c) => c.id === companyId)?.name
                : "Select a company..."}
            </Text>
          </Pressable>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <Pressable
        disabled={loading}
        style={({ pressed }) => [
          styles.createBtn,
          pressed && styles.pressed,
          loading && { opacity: 0.7 },
        ]}
        onPress={createEquipment}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createText}>Create Equipment</Text>
        )}
      </Pressable>

      {/* ✅ MODAL */}
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
              onPress={() => setModalVisible(false)}
              style={styles.closeBtn}
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
    paddingTop: 70,
    paddingBottom: 50,
  },

  header: { marginBottom: 20 },

  topAccent: {
    height: 4,
    width: 60,
    backgroundColor: "#7c3aed",
    borderRadius: 10,
    marginBottom: 16,
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },

  subtitle: {
    color: "#9ca3af",
    marginTop: 6,
    fontSize: 13,
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  sectionTitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 12,
    textTransform: "uppercase",
  },

  input: {
    backgroundColor: "#020617",
    color: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  inputActive: {
    borderColor: "#7c3aed",
  },

  selector: {
    backgroundColor: "#020617",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
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
    fontSize: 16,
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

  emptyBox: {
    alignItems: "center",
    paddingVertical: 10,
  },

  empty: {
    color: "#6b7280",
    fontSize: 13,
    marginBottom: 8,
  },

  linkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  linkText: {
    color: "#7c3aed",
    fontSize: 13,
    fontWeight: "600",
  },

  error: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 6,
  },

  createBtn: {
    backgroundColor: "#7c3aed",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },

  createText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  pressed: {
    transform: [{ scale: 0.97 }],
  },
});