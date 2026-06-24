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

export default function EditEquipmentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { equipment } = route.params;

  const [name, setName] = useState(equipment.name);
  const [serialNumber, setSerialNumber] = useState(equipment.serialNumber);
  const [brand, setBrand] = useState(equipment.brand || "");
  const [model, setModel] = useState(equipment.model || "");

  const [installationDate, setInstallationDate] = useState(
    equipment.installationDate?.slice(0, 10) || ""
  );

  const [warrantyExpiry, setWarrantyExpiry] = useState(
    equipment.warrantyExpiry?.slice(0, 10) || ""
  );

  const [companyId, setCompanyId] = useState(equipment.companyId);

  const [companies, setCompanies] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

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

  const updateEquipment = async () => {
    if (!name.trim() || !serialNumber.trim()) {
      setError("Name and Serial Number are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.patch(`/equipment/${equipment.id}`, {
        name,
        serialNumber,
        brand,
        model,
        companyId,
        installationDate: installationDate
          ? new Date(installationDate).toISOString()
          : undefined,
        warrantyExpiry: warrantyExpiry
          ? new Date(warrantyExpiry).toISOString()
          : undefined,
      });

      Alert.alert("Success", "Equipment updated");
      navigation.goBack();
    } catch (err: any) {
      console.log("UPDATE ERROR:", err?.response?.data || err.message);

      setError(
        err?.response?.data?.message || "Failed to update equipment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Equipment</Text>
      <Text style={styles.subtitle}>Update equipment details</Text>

      {/* FORM */}
      <View style={styles.card}>
        <TextInput
          placeholder="Equipment Name"
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Serial Number"
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={serialNumber}
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

      {/* COMPANY SELECTOR */}
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

      {/* BUTTON */}
      <Pressable style={styles.btn} onPress={updateEquipment}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Update Equipment</Text>
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