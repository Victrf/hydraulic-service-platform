import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect, useRef } from "react";
import { Alert, Linking } from "react-native";
import { api } from "../../api/client";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function PlansScreen() {
  const navigation = useNavigation();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnims = useRef<Animated.Value[]>([]);

  useEffect(() => {
    loadPlans();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  const ADMIN_PHONE = "+918095994004";

  const loadPlans = async () => {
    try {
      const res = await api.get("/plans");
      setPlans(res.data);
      scaleAnims.current = res.data.map(() => new Animated.Value(1));
    } catch (err) {
      console.log("PLAN ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!selectedPlan) return;
    Alert.alert(
      "Contact Admin",
      `You have selected the "${selectedPlan.name}" plan.\n\nCall the administrator to subscribe?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call Admin",
          onPress: () => Linking.openURL(`tel:${ADMIN_PHONE}`),
        },
      ],
    );
  };

  const getPlanMeta = (plan: any) => {
    const configs: Record<
      number,
      { icon: string; features: string[]; gradient: string[]; tag: string }
    > = {
      1: {
        icon: "bolt",
        features: ["1 Visit/Month", "Basic Support", "Email Reports"],
        gradient: ["#7c3aed", "#a855f7"],
        tag: "Starter",
      },
      3: {
        icon: "shield-alt",
        features: [
          "1 Visit/Quarter",
          "Priority Support",
          "Detailed Reports",
          "Discounted Parts",
        ],
        gradient: ["#3b82f6", "#06b6d4"],
        tag: "Popular",
      },
      6: {
        icon: "crown",
        features: [
          "1 Visit/Half-Year",
          "24/7 Priority",
          "Full Diagnostics",
          "Free Parts",
          "Dedicated Manager",
        ],
        gradient: ["#f59e0b", "#ef4444"],
        tag: "Premium",
      },
    };
    return (
      configs[plan.intervalMonths] || {
        icon: "tools",
        features: ["Scheduled Maintenance", "Service Support"],
        gradient: ["#64748b", "#94a3b8"],
        tag: "Standard",
      }
    );
  };

  const getPlanDescription = (plan: any) => {
    const descs: Record<number, string> = {
      1: "Perfect for light usage. One professional maintenance visit every month to keep your equipment running smoothly.",
      3: "Our most balanced option. Quarterly inspections with priority scheduling and comprehensive reporting.",
      6: "Maximum protection for critical equipment. Bi-annual deep maintenance with all premium perks included.",
    };
    return (
      descs[plan.intervalMonths] ||
      "Professional maintenance and service support tailored to your needs."
    );
  };

  const handlePressIn = (index: number) => {
    Animated.spring(scaleAnims.current[index], {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = (index: number) => {
    Animated.spring(scaleAnims.current[index], {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#020617",
        }}
      >
        <Text style={{ color: "#fff" }}>Loading Plans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Animated Background */}
      <LinearGradient
        colors={["#0f172a", "#1e1b4b", "#0f172a"]}
        style={styles.backgroundGradient}
      />

      {/* Decorative Orbs */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Animated Header */}
          <Animated.View
            style={[
              styles.header,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.headerBadge}>
              <MaterialCommunityIcons
                name="shield-check"
                size={14}
                color="#a78bfa"
              />
              <Text style={styles.headerBadgeText}>
                Annual Maintenance Contract
              </Text>
            </View>
            <Text style={styles.title}>Choose Your Plan</Text>
            <Text style={styles.subtitle}>
              Select a maintenance plan that matches your equipment needs and
              budget
            </Text>
          </Animated.View>

          {/* Plan Cards */}
          {plans.map((plan: any, index: number) => {
            const isSelected = selectedPlan?.id === plan.id;
            const meta = getPlanMeta(plan);
            const monthlyPrice = Math.round(plan.price / plan.intervalMonths);

            return (
              <Animated.View
                key={plan.id}
                style={{
                  transform: [
                    {
                      scale: scaleAnims.current[index] ?? new Animated.Value(1),
                    },
                  ],
                  opacity: fadeAnim,
                }}
              >
                <Pressable
                  onPress={() => setSelectedPlan(plan)}
                  onPressIn={() => handlePressIn(index)}
                  onPressOut={() => handlePressOut(index)}
                  style={({ pressed }) => [
                    styles.card,
                    isSelected && [
                      styles.cardSelected,
                      {
                        borderColor: meta.gradient[0] + "66",
                        shadowColor: meta.gradient[0],
                      },
                    ],
                    pressed && !isSelected && styles.cardPressed,
                  ]}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <LinearGradient
                      colors={meta.gradient}
                      style={styles.selectedIndicator}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  )}

                  <View style={styles.cardContent}>
                    {/* Top Row */}
                    <View style={styles.cardTop}>
                      <View style={styles.planIdentity}>
                        <View
                          style={[
                            styles.iconContainer,
                            {
                              backgroundColor: isSelected
                                ? meta.gradient[0] + "20"
                                : "rgba(255,255,255,0.05)",
                            },
                          ]}
                        >
                          <FontAwesome5
                            name={meta.icon}
                            size={18}
                            color={isSelected ? meta.gradient[0] : "#94a3b8"}
                          />
                        </View>
                        <View>
                          <View style={styles.nameRow}>
                            <Text
                              style={[
                                styles.planName,
                                isSelected && styles.planNameSelected,
                              ]}
                            >
                              {plan.name}
                            </Text>
                            {meta.tag && (
                              <View
                                style={[
                                  styles.tag,
                                  { backgroundColor: meta.gradient[0] + "20" },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.tagText,
                                    { color: meta.gradient[0] },
                                  ]}
                                >
                                  {meta.tag}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.planDuration}>
                            {plan.intervalMonths}{" "}
                            {plan.intervalMonths === 1 ? "Month" : "Months"}{" "}
                            Duration
                          </Text>
                        </View>
                      </View>

                      {/* Price */}
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceSymbol}>₹</Text>
                        <Text
                          style={[
                            styles.price,
                            isSelected && styles.priceSelected,
                          ]}
                        >
                          {plan.price ?? "--"}
                        </Text>
                      </View>
                    </View>

                    {/* Divider */}
                    <View
                      style={[
                        styles.divider,
                        isSelected && {
                          backgroundColor: meta.gradient[0] + "30",
                        },
                      ]}
                    />

                    {/* Features */}
                    <View style={styles.featuresRow}>
                      {meta.features.map((feature: string, i: number) => (
                        <View key={i} style={styles.featureChip}>
                          <Ionicons
                            name="checkmark-circle"
                            size={12}
                            color={isSelected ? meta.gradient[0] : "#64748b"}
                          />
                          <Text
                            style={[
                              styles.featureText,
                              isSelected && { color: "#e2e8f0" },
                            ]}
                          >
                            {feature}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Monthly Equivalent */}
                    <View style={styles.monthlyRow}>
                      <Ionicons
                        name="trending-down"
                        size={12}
                        color="#64748b"
                      />
                      <Text style={styles.monthlyText}>
                        Equivalent to ₹{monthlyPrice}/month
                      </Text>
                    </View>
                  </View>

                  {/* Selected Checkmark */}
                  {isSelected && (
                    <View style={styles.checkmarkContainer}>
                      <LinearGradient
                        colors={meta.gradient}
                        style={styles.checkmarkGradient}
                      >
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </LinearGradient>
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}

          {!plans.length && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="package-variant"
                size={48}
                color="#334155"
              />
              <Text style={styles.emptyText}>No plans available</Text>
              <Text style={styles.emptySubtext}>
                Check back later for new subscription options
              </Text>
            </View>
          )}

          {/* Selected Plan Details Preview */}
          {selectedPlan && (
            <Animated.View
              style={[styles.previewSection, { opacity: fadeAnim }]}
            >
              <View style={styles.previewHeader}>
                <View style={styles.previewLine} />
                <Text style={styles.previewLabel}>Plan Details</Text>
                <View style={styles.previewLine} />
              </View>

              <View style={styles.previewCard}>
                <LinearGradient
                  colors={getPlanMeta(selectedPlan).gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.previewAccent}
                />
                <View style={styles.previewContent}>
                  <Text style={styles.previewTitle}>{selectedPlan.name}</Text>
                  <Text style={styles.previewDescription}>
                    {getPlanDescription(selectedPlan)}
                  </Text>

                  <View style={styles.benefitsGrid}>
                    <BenefitItem
                      icon="calendar-check"
                      label="Visits"
                      value={`${selectedPlan.intervalMonths}x`}
                      color={getPlanMeta(selectedPlan).gradient[0]}
                    />
                    <BenefitItem
                      icon="headset"
                      label="Support"
                      value="Included"
                      color={getPlanMeta(selectedPlan).gradient[0]}
                    />
                    <BenefitItem
                      icon="file-document"
                      label="Reports"
                      value="Detailed"
                      color={getPlanMeta(selectedPlan).gradient[0]}
                    />
                  </View>
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Sticky Footer */}
        <View style={styles.footer}>
          {selectedPlan && (
            <View style={styles.footerSummary}>
              <View style={styles.footerSummaryLeft}>
                <Text style={styles.footerPlanName}>{selectedPlan.name}</Text>
                <Text style={styles.footerPlanPrice}>
                  ₹{selectedPlan.price}
                </Text>
              </View>
              <View style={styles.footerDivider} />
            </View>
          )}

          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.button,
              !selectedPlan && styles.buttonDisabled,
              pressed && selectedPlan && styles.buttonPressed,
            ]}
          >
            <LinearGradient
              colors={
                selectedPlan
                  ? getPlanMeta(selectedPlan).gradient
                  : ["#374151", "#4b5563"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {selectedPlan ? "Subscribe Now" : "Select a Plan"}
              </Text>
              {selectedPlan && (
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#fff"
                  style={styles.buttonIcon}
                />
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function BenefitItem({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.benefitItem}>
      <View style={[styles.benefitIcon, { backgroundColor: color + "15" }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.benefitValue}>{value}</Text>
      <Text style={styles.benefitLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.15,
  },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: "#7c3aed",
    top: -100,
    right: -80,
    blur: 100,
  },
  orb2: {
    width: 250,
    height: 250,
    backgroundColor: "#3b82f6",
    bottom: 100,
    left: -100,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 220,
  },

  // Header
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  headerBadgeText: {
    color: "#a78bfa",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    maxWidth: width * 0.8,
  },

  // Cards
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "rgba(148, 163, 184, 0.08)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardSelected: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  selectedIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  cardContent: {
    padding: 20,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  planIdentity: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  planName: {
    color: "#e2e8f0",
    fontSize: 17,
    fontWeight: "700",
  },
  planNameSelected: {
    color: "#f8fafc",
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  planDuration: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "500",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceSymbol: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
  },
  price: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  priceSelected: {
    color: "#fff",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(148, 163, 184, 0.08)",
    marginVertical: 16,
  },
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  featureText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },
  monthlyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 5,
  },
  monthlyText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "500",
  },
  checkmarkContainer: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  checkmarkGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    color: "#475569",
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    color: "#334155",
    fontSize: 13,
  },

  // Preview Section
  previewSection: {
    marginTop: 24,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  previewLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(148, 163, 184, 0.1)",
  },
  previewLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  previewCard: {
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.08)",
    overflow: "hidden",
    flexDirection: "row",
  },
  previewAccent: {
    width: 4,
  },
  previewContent: {
    flex: 1,
    padding: 20,
  },
  previewTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  previewDescription: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  benefitsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.08)",
  },
  benefitItem: {
    alignItems: "center",
    gap: 6,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  benefitValue: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
  },
  benefitLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "rgba(2, 6, 23, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.06)",
  },
  footerSummary: {
    marginBottom: 12,
  },
  footerSummaryLeft: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  footerPlanName: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
  footerPlanPrice: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "800",
  },
  footerDivider: {
    height: 1,
    backgroundColor: "rgba(148, 163, 184, 0.08)",
  },
  button: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});
