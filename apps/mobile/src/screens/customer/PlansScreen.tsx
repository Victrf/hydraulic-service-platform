import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useState } from "react";

export default function PlansScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { plans = [] } = route.params || {};

  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const handleContinue = () => {
    if (!selectedPlan) return;

    navigation.navigate("MySubscription", {
      subscription: { plan: selectedPlan },
    });
  };

  const getPlanDescription = (plan: any) => {
    if (!plan) return "";

    switch (plan.intervalMonths) {
      case 1:
        return "Best for short-term needs. Includes one scheduled maintenance visit per month.";
      case 3:
        return "Balanced option for regular usage. Includes periodic maintenance and inspection support.";
      case 6:
        return "Ideal for long-term reliability. Covers scheduled maintenance visits and priority service support.";
      default:
        return "Includes scheduled maintenance and service support.";
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1668455199701-284281127a87?w=600&auto=format&fit=crop&q=60",
      }}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.title}>Choose AMC Plan </Text>
              <Text style={styles.subtitle}>
                Select a plan that fits your usage and maintenance needs
              </Text>
            </View>

            {/* PLANS */}
            {plans.map((plan: any) => {
              const isSelected = selectedPlan?.id === plan.id;

              return (
                <Pressable
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan)}
                  style={[styles.card, isSelected && styles.cardSelected]}
                >
                  <View style={styles.cardTop}>
                    <View>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.planDuration}>
                        {plan.intervalMonths} Month Plan
                      </Text>
                    </View>

                    <Text style={styles.price}>₹{plan.price ?? "--"}</Text>
                  </View>

                  {isSelected && <View style={styles.selectedBar} />}
                </Pressable>
              );
            })}

            {!plans.length && (
              <Text style={styles.emptyText}>No plans available</Text>
            )}

            {/* 🔥 PREVIEW SECTION (fills your red area) */}
            {selectedPlan && (
              <View style={styles.previewSection}>
                <View style={styles.previewCard}>
                  <Text style={styles.previewTitle}>{selectedPlan.name}</Text>

                  <Text style={styles.previewText}>
                    {getPlanDescription(selectedPlan)}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* FOOTER (UNCHANGED — still has description) */}
          <View style={styles.footer}>
            {selectedPlan && (
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionTitle}>{selectedPlan.name}</Text>

                <Text style={styles.descriptionText}>
                  {getPlanDescription(selectedPlan)}
                </Text>
              </View>
            )}

            <Pressable
              onPress={handleContinue}
              style={[styles.button, !selectedPlan && styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>
                {selectedPlan ? "Continue" : "Select a plan"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.85)",
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingTop: 60, // 🔥 ADD THIS (push content down)
    paddingBottom: 100,
  },

  header: {
    marginBottom: 24,
    marginTop: 10,
  },

  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 6,
  },

  card: {
    backgroundColor: "rgba(17,24,39,0.85)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  cardSelected: {
    borderColor: "#7c3aed",
    shadowColor: "#7c3aed",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  planName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  planDuration: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },

  price: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },

  selectedBar: {
    marginTop: 12,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#7c3aed",
  },

  emptyText: {
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 40,
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    backgroundColor: "rgba(2,6,23,0.95)",
  },

  descriptionBox: {
    backgroundColor: "rgba(17,24,39,0.85)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  descriptionTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },

  descriptionText: {
    color: "#9ca3af",
    fontSize: 12,
    lineHeight: 18,
  },

  button: {
    backgroundColor: "#7c3aed",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonDisabled: {
    backgroundColor: "#374151",
  },

  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  previewSection: {
    marginTop: 30,
    marginBottom: 20,
  },

  previewCard: {
    minHeight: 140,
    paddingHorizontal: 4, // 🔥 keep spacing but no box feel
    paddingVertical: 8,

    backgroundColor: "transparent", // 🔥 key change
    borderWidth: 0,

    shadowOpacity: 0, // 🔥 remove glow
    elevation: 0,
  },
  previewTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  previewText: {
    color: "#cbd5f5",
    fontSize: 13,
    lineHeight: 20,
  },
});
