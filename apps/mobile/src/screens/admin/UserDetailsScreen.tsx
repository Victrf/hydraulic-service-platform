import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function UserDetailsScreen() {
  const route = useRoute<any>();
  const { userId } = route.params;
  const navigation = useNavigation<any>();

  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userRes = await api.get(`/users/${userId}`);

      console.log("USER DETAILS:", userRes.data);

      setUser(userRes.data);

      // ADMIN ONLY
      if (userRes.data.role === "admin") {
        const companyRes = await api.get("/companies");

        console.log("COMPANIES:", companyRes.data);

        setCompanies(companyRes.data || []);
      }

      // REQUESTS
      const requestRes = await api.get(`/service-requests/user/${userId}`);

      console.log("USER REQUESTS:", requestRes.data);

      setRequests(requestRes.data.requests || []);
      const historyRes = await api.get(`/users/${userId}/activity`);

      console.log("USER HISTORY:", historyRes.data);

      setHistory(historyRes.data || []);
    } catch (err) {
      console.log("USER DETAILS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>User not found</Text>
      </View>
    );
  }

  const isAdmin = user.role === "admin";
  const isCustomer = user.role === "customer";
  const isTechnician = user.role === "technician";
  const activeRequests = requests.filter(
    (request) => request.status !== "completed",
  );
  const completedRequests = requests.filter(
    (request) => request.status === "completed",
  );

  const loginLogs = history.filter((log) => log.action === "LOGIN");

  const logoutLogs = history.filter((log) => log.action === "LOGOUT");

  const lastLogin = loginLogs[0];
  const lastLogout = logoutLogs[0];

  let sessionDuration = "-";

  if (lastLogin && lastLogout) {
    const start = new Date(lastLogin.createdAt).getTime();
    const end = new Date(lastLogout.createdAt).getTime();

    const diffMs = Math.abs(end - start);

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    sessionDuration = `${hours}h ${minutes}m`;
  }

  return (
    <ScrollView style={styles.screen}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name?.charAt(0)?.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>{user.name}</Text>

        <Text style={styles.email}>{user.email}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user.role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* TABS */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
      >
        <Pressable
          style={[styles.tab, activeTab === "overview" && styles.activeTab]}
          onPress={() => setActiveTab("overview")}
        >
          <Text style={styles.tabText}>Overview</Text>
        </Pressable>

        {/* ADMIN */}
        {/* ADMIN */}
        {isAdmin && (
          <>
            <Pressable
              style={[styles.tab, activeTab === "company" && styles.activeTab]}
              onPress={() => setActiveTab("company")}
            >
              <View style={styles.tabWithBadge}>
                <Text style={styles.tabText}>Company</Text>

                <View style={styles.companyBadge}>
                  <Text style={styles.badgeText}>{companies.length}</Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              style={[styles.tab, activeTab === "requests" && styles.activeTab]}
              onPress={() => setActiveTab("requests")}
            >
              <View style={styles.tabWithBadge}>
                <Text style={styles.tabText}>Requests</Text>

                <View style={styles.requestsBadge}>
                  <Text style={styles.badgeText}>{activeRequests.length}</Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              style={[
                styles.tab,
                activeTab === "completed" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("completed")}
            >
              <View style={styles.tabWithBadge}>
                <Text style={styles.tabText}>Completed</Text>

                <View style={styles.completedBadge}>
                  <Text style={styles.badgeText}>
                    {completedRequests.length}
                  </Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              style={[styles.tab, activeTab === "history" && styles.activeTab]}
              onPress={() => setActiveTab("history")}
            >
              <View style={styles.tabWithBadge}>
                <Text style={styles.tabText}>History</Text>

                <View style={styles.historyBadge}>
                  <Text style={styles.badgeText}>{history.length}</Text>
                </View>
              </View>
            </Pressable>
          </>
        )}
        {/* CUSTOMER */}
        {/* CUSTOMER */}
        {isCustomer && (
          <>
            <Pressable
              style={[styles.tab, activeTab === "company" && styles.activeTab]}
              onPress={() => setActiveTab("company")}
            >
              <View style={styles.tabWithBadge}>
                <Text style={styles.tabText}>Company</Text>

                <View style={styles.companyBadge}>
                  <Text style={styles.badgeText}>{user.company ? 1 : 0}</Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              style={[
                styles.tab,
                activeTab === "equipment" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("equipment")}
            >
              <View style={styles.tabWithBadge}>
                <Text style={styles.tabText}>Equipment</Text>

                <View style={styles.equipmentBadge}>
                  <Text style={styles.badgeText}>
                    {user.availableEquipment?.length || 0}
                  </Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              style={[styles.tab, activeTab === "requests" && styles.activeTab]}
              onPress={() => setActiveTab("requests")}
            >
              <View style={styles.tabWithBadge}>
                <Text style={styles.tabText}>Requests</Text>

                <View style={styles.requestsBadge}>
                  <Text style={styles.badgeText}>{activeRequests.length}</Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              style={[
                styles.tab,
                activeTab === "completed" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("completed")}
            >
              <View style={styles.tabWithBadge}>
                <Text style={styles.tabText}>Completed</Text>

                <View style={styles.completedBadge}>
                  <Text style={styles.badgeText}>
                    {completedRequests.length}
                  </Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              style={[styles.tab, activeTab === "history" && styles.activeTab]}
              onPress={() => setActiveTab("history")}
            >
              <View style={styles.tabWithBadge}>
                <Text style={styles.tabText}>History</Text>

                <View style={styles.historyBadge}>
                  <Text style={styles.badgeText}>{history.length}</Text>
                </View>
              </View>
            </Pressable>
          </>
        )}

        {/* TECHNICIAN */}
        {isTechnician && (
          <>
            <Pressable
              style={[styles.tab, activeTab === "assigned" && styles.activeTab]}
              onPress={() => setActiveTab("assigned")}
            >
              <Text style={styles.tabText}>Assigned</Text>
            </Pressable>

            <Pressable
              style={[
                styles.tab,
                activeTab === "completed" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("completed")}
            >
              <View style={styles.tabWithBadge}>
                <Text style={styles.tabText}>Completed</Text>

                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>
                    {completedRequests.length}
                  </Text>
                </View>
              </View>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === "history" && styles.activeTab]}
              onPress={() => setActiveTab("history")}
            >
              <Text style={styles.tabText}>History</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>User Information</Text>

          <InfoRow label="Name" value={user.name} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Role" value={user.role} />

          <View style={styles.overviewGrid}>
            <View style={styles.statCardPurple}>
              <Text style={styles.statLabel}>Created</Text>
              <Text style={styles.statValue}>
                {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.statCardGreen}>
              <Text style={styles.statLabel}>Last Login</Text>
              <Text style={styles.statValue}>
                {lastLogin
                  ? new Date(lastLogin.createdAt).toLocaleDateString()
                  : "-"}
              </Text>
            </View>

            <View style={styles.statCardRed}>
              <Text style={styles.statLabel}>Last Logout</Text>
              <Text style={styles.statValue}>
                {lastLogout
                  ? new Date(lastLogout.createdAt).toLocaleDateString()
                  : "-"}
              </Text>
            </View>

            <View style={styles.statCardBlue}>
              <Text style={styles.statLabel}>Session</Text>
              <Text style={styles.statValue}>{sessionDuration}</Text>
            </View>
          </View>
        </View>
      )}

      {/* COMPANY */}

      {/* COMPANY */}
      {activeTab === "company" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Companies</Text>

          {/* ADMIN */}
          {isAdmin && (
            <>
              {companies.length > 0 ? (
                companies.map((company) => (
                  <View key={company.id} style={styles.adminCompanyCard}>
                    <View style={styles.companyTopRow}>
                      <Text style={styles.companyName}>{company.name}</Text>

                      <View style={styles.companyActiveBadge}>
                        <Text style={styles.companyBadgeText}>Active</Text>
                      </View>
                    </View>

                    <Text style={styles.companyMeta}>
                      {company.address || "No address"}
                    </Text>

                    <Text style={styles.companyMeta}>
                      {company.phone || "No phone"}
                    </Text>

                    <View style={styles.companyStatsRow}>
                      <View style={styles.companyStatBox}>
                        <Text style={styles.companyStatNumber}>
                          {company.users?.length || 0}
                        </Text>

                        <Text style={styles.companyStatLabel}>Users</Text>
                      </View>

                      <View style={styles.companyStatBox}>
                        <Text style={styles.companyStatNumber}>
                          {company.equipment?.length || 0}
                        </Text>

                        <Text style={styles.companyStatLabel}>Equipment</Text>
                      </View>
                    </View>

                    <View style={styles.companyActions}>
                      <Pressable
                        style={styles.actionBtn}
                        onPress={() =>
                          navigation.navigate("CompanyDetails", {
                            companyId: company.id,
                          })
                        }
                      >
                        <Text style={styles.actionText}>View</Text>
                      </Pressable>

                      <Pressable
                        style={styles.actionBtn}
                        onPress={() =>
                          navigation.navigate("EditCompany", {
                            company,
                          })
                        }
                      >
                        <Text style={styles.actionText}>Edit</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.companyEmptyCard}>
                  <Text style={styles.companyEmptyTitle}>
                    No Companies Found
                  </Text>

                  <Text style={styles.companyEmptySub}>
                    There are currently no registered companies.
                  </Text>
                </View>
              )}
            </>
          )}

          {/* CUSTOMER */}
          {isCustomer && (
            <>
              {user.company ? (
                <View style={styles.customerCompanyCard}>
                  <View style={styles.customerCompanyHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.companyTopRow}>
                        <Text style={styles.companyName}>
                          {user.company.name}
                        </Text>

                        <View style={styles.companyActiveBadge}>
                          <Text style={styles.companyBadgeText}>Active</Text>
                        </View>
                      </View>

                      <InfoRow
                        label="Email"
                        value={user.company.email || "-"}
                      />

                      <InfoRow
                        label="Address"
                        value={user.company.address || "-"}
                      />

                      <InfoRow
                        label="Phone"
                        value={user.company.phone || "-"}
                      />
                    </View>
                  </View>

                  <InfoRow
                    label="Contact Name"
                    value={user.company.contactName || "-"}
                  />

                  <InfoRow
                    label="Contact Email"
                    value={user.company.contactEmail || "-"}
                  />

                  <InfoRow
                    label="Contact Phone"
                    value={user.company.contactPhone || "-"}
                  />

                  <InfoRow
                    label="Contact Position"
                    value={user.company.contactPosition || "-"}
                  />

                  <View style={styles.companyActions}>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() =>
                        navigation.navigate("CompanyDetails", {
                          companyId: user.company.id,
                        })
                      }
                    >
                      <Text style={styles.actionText}>View</Text>
                    </Pressable>

                    <Pressable
                      style={styles.actionBtn}
                      onPress={() =>
                        navigation.navigate("EditCompany", {
                          company: user.company,
                        })
                      }
                    >
                      <Text style={styles.actionText}>Edit</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.companyEmptyCard}>
                  <Text style={styles.companyEmptyTitle}>
                    No Company Assigned
                  </Text>

                  <Text style={styles.companyEmptySub}>
                    This customer has not been linked to any company.
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* EQUIPMENT */}
      {activeTab === "equipment" && isCustomer && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Assigned Equipment</Text>

          {user.availableEquipment?.length > 0 ? (
            user.availableEquipment.map((equipment: any, index: number) => (
              <View key={equipment.id || index} style={styles.equipmentCard}>
                <Text style={styles.equipmentName}>{equipment.name}</Text>

                <View style={styles.equipmentStatusRow}>
                  <Text style={styles.equipmentStatusText}>Assigned</Text>

                  <Text style={styles.equipmentStatusIcon}>⚙</Text>
                </View>

                <Text style={styles.equipmentMeta}>
                  Serial: {equipment.serialNumber}
                </Text>

                <Text style={styles.equipmentMeta}>
                  Brand: {equipment.brand || "-"}
                </Text>

                <Text style={styles.equipmentMeta}>
                  Model: {equipment.model || "-"}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.placeholder}>No equipment assigned</Text>
          )}
        </View>
      )}

      {/* REQUESTS */}
      {activeTab === "requests" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Requests</Text>

          {activeRequests.length > 0 ? (
            activeRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <Text style={styles.requestTitle}>{request.description}</Text>

                <View style={styles.pendingRow}>
                  <Text style={styles.pendingText}>
                    {request.status === "pending" ? "Pending" : request.status}
                  </Text>

                  <Text style={styles.pendingIcon}>●</Text>
                </View>

                <Text style={styles.requestMeta}>
                  Equipment: {request.equipment?.name || "-"}
                </Text>

                <Text style={styles.requestMeta}>
                  Company: {request.company?.name || "-"}
                </Text>

                <Text style={styles.requestMeta}>
                  Technician:{" "}
                  {request.assignment?.technician?.name || "Unassigned"}
                </Text>

                {isAdmin && (
                  <View style={styles.requestActions}>
                    {!request.assignment ? (
                      <Pressable
                        style={styles.actionBtn}
                        onPress={() =>
                          navigation.navigate("AssignTechnician", {
                            requestId: request.id,
                          })
                        }
                      >
                        <Text style={styles.actionText}>Assign</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        style={styles.actionBtn}
                        onPress={() =>
                          navigation.navigate("AssignTechnician", {
                            requestId: request.id,
                            reassign: true,
                          })
                        }
                      >
                        <Text style={styles.actionText}>Reassign</Text>
                      </Pressable>
                    )}

                    <Pressable
                      style={styles.actionBtn}
                      onPress={() =>
                        navigation.navigate("ServiceRequestDetails", {
                          requestId: request.id,
                        })
                      }
                    >
                      <Text style={styles.actionText}>Open</Text>
                    </Pressable>
                  </View>
                )}

                <Text style={styles.requestMeta}>
                  Created: {new Date(request.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.placeholder}>No active requests</Text>
          )}
        </View>
      )}

      {/* ASSIGNED */}
      {activeTab === "assigned" && isTechnician && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Assigned Work</Text>

          {activeRequests.length > 0 ? (
            activeRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <Text style={styles.requestTitle}>{request.description}</Text>

                <Text style={styles.requestMeta}>Status: {request.status}</Text>

                <Text style={styles.requestMeta}>
                  Equipment: {request.equipment?.name || "-"}
                </Text>

                <Text style={styles.requestMeta}>
                  Company: {request.company?.name || "-"}
                </Text>

                <Text style={styles.requestMeta}>
                  Created: {new Date(request.createdAt).toLocaleDateString()}
                </Text>

                <View style={styles.requestActions}>
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() =>
                      navigation.navigate("ServiceRequestDetails", {
                        requestId: request.id,
                      })
                    }
                  >
                    <Text style={styles.actionText}>Open</Text>
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.placeholder}>No assigned requests</Text>
          )}
        </View>
      )}
      {/* COMPLETED */}
      {activeTab === "completed" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Completed</Text>

          {completedRequests.length > 0 ? (
            completedRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <Text style={styles.requestTitle}>{request.description}</Text>

                <Text style={styles.requestMeta}>
                  Equipment: {request.equipment?.name || "-"}
                </Text>

                <Text style={styles.requestMeta}>
                  Company: {request.company?.name || "-"}
                </Text>

                <Text style={styles.requestMeta}>
                  Technician:{" "}
                  {request.assignment?.technician?.name || "Unassigned"}
                </Text>

                <View style={styles.completedRow}>
                  <Text style={styles.completedText}>Completed</Text>

                  <Text style={styles.completedIcon}>✓</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.placeholder}>No completed requests</Text>
          )}
        </View>
      )}

      {/* HISTORY */}
      {activeTab === "history" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>History</Text>

          {history.length > 0 ? (
            history.map((log) => (
              <View key={log.id} style={styles.historyCard}>
                <Text style={styles.historyAction}>{log.action}</Text>

                <Text style={styles.historyMessage}>{log.message}</Text>

                <Text style={styles.historyDate}>
                  {new Date(log.createdAt).toLocaleString()}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.placeholder}>No history found</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
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

  empty: {
    color: "#fff",
  },

  header: {
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 40,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#7c3aed",
    shadowColor: "#7c3aed",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 12,
  },

  avatarText: {
    color: "#7c3aed",
    fontSize: 28,
    fontWeight: "700",
  },

  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  email: {
    color: "#9ca3af",
    marginTop: 4,
  },

  roleBadge: {
    marginTop: 12,
    backgroundColor: "#7c3aed",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  roleText: {
    color: "#fff",
    fontWeight: "600",
  },

  tabs: {
    marginBottom: 20,
    maxHeight: 52,
  },

  tab: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },

  activeTab: {
    borderWidth: 1,
    borderColor: "#7c3aed",
    backgroundColor: "rgba(124,58,237,0.15)",
  },

  tabText: {
    color: "#fff",
  },

  card: {
    padding: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 18,
  },

  row: {
    marginBottom: 12,
  },

  label: {
    color: "#94a3b8",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },

  value: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  placeholder: {
    color: "#9ca3af",
  },

  /*euipment card*/
  equipmentCard: {
    backgroundColor: "#020617",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  equipmentName: {
    color: "#fff",
    fontWeight: "700",
    marginBottom: 4,
  },
  /*company card*/
  companyCard: {
    backgroundColor: "#020617",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  companyName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  companyMeta: {
    color: "#9ca3af",
    marginTop: 4,
  },

  companyActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  /*action button*/
  actionBtn: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  actionText: {
    color: "#fff",
    fontWeight: "600",
  },
  /*request card*/
  requestCard: {
    backgroundColor: "#020617",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  requestTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },

  requestMeta: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  //history card*/
  historyCard: {
    backgroundColor: "#020617",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  historyAction: {
    color: "#7c3aed",
    fontWeight: "700",
    marginBottom: 6,
  },

  historyMessage: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 6,
  },

  historyDate: {
    color: "#6b7280",
    fontSize: 12,
  },

  equipmentMeta: {
    color: "#9ca3af",
    fontSize: 12,
  },
  /*customer company card*/
  customerCompanyCard: {
    backgroundColor: "#020617",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  customerCompanyHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },

  completedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  completedText: {
    color: "#22c55e",
    fontSize: 13,
    fontWeight: "600",
  },

  completedIcon: {
    color: "#22c55e",
    fontSize: 20,
    fontWeight: "700",
  },

  pendingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  pendingText: {
    color: "#f59e0b",
    fontSize: 13,
    fontWeight: "600",
  },

  pendingIcon: {
    color: "#f59e0b",
    fontSize: 16,
  },
  equipmentStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  equipmentStatusText: {
    color: "#3b82f6",
    fontSize: 13,
    fontWeight: "600",
  },
  companyStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  companyStatusText: {
    color: "#06b6d4",
    fontSize: 13,
    fontWeight: "600",
  },

  companyStatusIcon: {
    fontSize: 16,
  },

  equipmentStatusIcon: {
    color: "#3b82f6",
    fontSize: 16,
  },

  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },

  statCardPurple: {
    width: "48%",
    backgroundColor: "#7c3aed",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },

  statCardGreen: {
    width: "48%",
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },

  statCardRed: {
    width: "48%",
    backgroundColor: "#dc2626",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },

  statCardBlue: {
    width: "48%",
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },

  statLabel: {
    color: "#e5e7eb",
    fontSize: 12,
    marginBottom: 8,
    fontWeight: "600",
  },

  statValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  adminCompanyCard: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },

  companyTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  companyActiveBadge: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  companyBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  companyStatsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },

  companyStatBox: {
    flex: 1,
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  companyStatNumber: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  companyStatLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },

  companyEmptyCard: {
    backgroundColor: "#7f1d1d",
    padding: 18,
    borderRadius: 14,
  },

  companyEmptyTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },

  companyEmptySub: {
    color: "#fecaca",
    fontSize: 13,
  },
  tabWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  completedBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },

  completedBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  companyBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },

  requestsBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },

  historyBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#8b5cf6",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  equipmentBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#06b6d4",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
});
