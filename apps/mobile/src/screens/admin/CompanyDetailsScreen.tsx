import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";

export default function CompanyDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { companyId } = route.params;

  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "equipment"
  >("overview");

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const res = await api.get(`/companies/${companyId}`);

      console.log("COMPANY DETAILS:", res.data);

      setCompany(res.data);
    } catch (err) {
      console.log("COMPANY DETAILS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      ?.map((w) => w[0])
      ?.join("")
      ?.toUpperCase() || "?";

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!company) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>Company not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>

        <Pressable
          style={styles.editBtn}
          onPress={() =>
            navigation.navigate("EditCompany", {
              company,
            })
          }
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>

      {/* COMPANY HEADER */}
      <View style={styles.companyHeader}>
        {company.logoUrl ? (
          <Image
            source={{
              uri: `${api.defaults.baseURL}/uploads/companies/${company.logoUrl}`,
            }}
            style={styles.logo}
          />
        ) : (
          <View style={styles.logoFallback}>
            <Text style={styles.logoText}>{getInitials(company.name)}</Text>
          </View>
        )}

        <Text style={styles.companyName}>{company.name}</Text>

        <Text style={styles.companyEmail}>{company.email || "No email"}</Text>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === "overview" && styles.activeTab]}
          onPress={() => setActiveTab("overview")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "overview" && styles.activeTabText,
            ]}
          >
            Overview
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "users" && styles.activeTab]}
          onPress={() => setActiveTab("users")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "users" && styles.activeTabText,
            ]}
          >
            Users ({company.users?.length || 0})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "equipment" && styles.activeTab]}
          onPress={() => setActiveTab("equipment")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "equipment" && styles.activeTabText,
            ]}
          >
            Equipment ({company.equipment?.length || 0})
          </Text>
        </Pressable>
      </View>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Company Information</Text>

            <InfoRow label="Email" value={company.email} />

            <InfoRow label="Phone" value={company.phone} />

            <InfoRow label="Address" value={company.address} />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Contact Person</Text>

            <InfoRow label="Name" value={company.contactName} />

            <InfoRow label="Email" value={company.contactEmail} />

            <InfoRow label="Phone" value={company.contactPhone} />

            <InfoRow label="Position" value={company.contactPosition} />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Escalating Person</Text>

            <InfoRow label="Name" value={company.escalatingName} />

            <InfoRow label="Email" value={company.escalatingEmail} />

            <InfoRow label="Phone" value={company.escalatingPhone} />

            <InfoRow label="Position" value={company.escalatingPosition} />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Statistics</Text>

            <InfoRow label="Users" value={String(company.users?.length || 0)} />

            <InfoRow
              label="Equipment"
              value={String(company.equipment?.length || 0)}
            />
          </View>
        </>
      )}

      {/* USERS */}
      {activeTab === "users" && (
        <>
          {company.users?.length > 0 ? (
            company.users.map((user: any, index: number) => (
              <View key={user.id || index} style={styles.card}>
                <Text style={styles.userName}>
                  {user.name || "Unnamed User"}
                </Text>

                <Text style={styles.meta}>{user.email || "No email"}</Text>

                <Text style={styles.meta}>{user.role || "No role"}</Text>
              </View>
            ))
          ) : (
            <View style={styles.card}>
              <Text style={styles.emptyText}>No users assigned</Text>
            </View>
          )}
        </>
      )}

      {/* EQUIPMENT */}
      {activeTab === "equipment" && (
        <>
          {company.equipment?.length > 0 ? (
            company.equipment.map((equipment: any, index: number) => (
              <View key={equipment.id || index} style={styles.card}>
                <Text style={styles.userName}>
                  {equipment.name || equipment.title || "Equipment"}
                </Text>

                <Text style={styles.meta}>
                  Serial: {equipment.serialNumber || "-"}
                </Text>

                <Text style={styles.meta}>Brand: {equipment.brand || "-"}</Text>

                <Text style={styles.meta}>Model: {equipment.model || "-"}</Text>
              </View>
            ))
          ) : (
            <View style={styles.card}>
              <Text style={styles.emptyText}>No equipment assigned</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={styles.infoValue}>{value || "-"}</Text>
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

  center: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#7c3aed",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  editText: {
    color: "#fff",
    fontWeight: "600",
  },

  companyHeader: {
    alignItems: "center",
    marginBottom: 24,
  },

  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
  },

  logoFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  logoText: {
    color: "#7c3aed",
    fontSize: 28,
    fontWeight: "700",
  },

  companyName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },

  companyEmail: {
    color: "#9ca3af",
    marginTop: 4,
  },

  tabs: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 8,
  },

  tab: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#7c3aed",
  },

  tabText: {
    color: "#9ca3af",
    fontSize: 12,
  },

  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
  },

  sectionTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 12,
  },

  infoRow: {
    marginBottom: 10,
  },

  infoLabel: {
    color: "#6b7280",
    fontSize: 12,
  },

  infoValue: {
    color: "#fff",
    marginTop: 2,
  },

  userName: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  meta: {
    color: "#9ca3af",
    marginTop: 4,
  },

  emptyText: {
    color: "#9ca3af",
    textAlign: "center",
  },
});
