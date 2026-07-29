import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  StatusBar,
  Platform,
  Animated,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useRef } from "react";

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
    setExpanded(!expanded);
  };

  const rotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const height = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Pressable
      style={[styles.faqCard, expanded && styles.faqCardActive]}
      onPress={toggleExpand}
      android_ripple={{ color: "rgba(255,255,255,0.05)" }}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.question}>{question}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons
            name="chevron-down"
            size={20}
            color={expanded ? "#a78bfa" : "#64748b"}
          />
        </Animated.View>
      </View>
      <Animated.View style={[styles.answerContainer, { height, opacity }]}>
        <Text style={styles.answer}>{answer}</Text>
      </Animated.View>
    </Pressable>
  );
};

export default function HelpScreen() {
  const callSupport = () => {
    Linking.openURL("tel:+1234567890");
  };

  const emailSupport = () => {
    Linking.openURL("mailto:support@hydraulicservice.com");
  };

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="help-buoy" size={28} color="#a78bfa" />
        </View>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subtitle}>
          Need help with equipment, service requests, or subscriptions? Our team
          is here for you.
        </Text>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Quick Support</Text>

        <Pressable
          style={({ pressed }) => [
            styles.actionCard,
            pressed && styles.actionCardPressed,
          ]}
          onPress={callSupport}
          android_ripple={{ color: "rgba(34,197,94,0.15)" }}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: "rgba(34,197,94,0.12)" },
            ]}
          >
            <Ionicons name="call-outline" size={22} color="#4ade80" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Call Support</Text>
            <Text style={styles.actionSub}>Speak directly with our team</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#475569" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionCard,
            pressed && styles.actionCardPressed,
          ]}
          onPress={emailSupport}
          android_ripple={{ color: "rgba(124,58,237,0.15)" }}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: "rgba(124,58,237,0.12)" },
            ]}
          >
            <Ionicons name="mail-outline" size={22} color="#a78bfa" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Email Support</Text>
            <Text style={styles.actionSub}>Send us your issue details</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#475569" />
        </Pressable>
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Frequently Asked</Text>

        <FAQItem
          question="How do I create a service request?"
          answer="Open your Profile tab, select your equipment, and tap 'Create Request'. Fill in the issue description and location, then submit."
        />
        <FAQItem
          question="How do I track my requests?"
          answer="Go to the Requests tab to monitor active, pending, and completed requests with real-time status updates."
        />
        <FAQItem
          question="What do subscriptions include?"
          answer="Subscription plans include scheduled maintenance, detailed reports, priority support, and discounted parts."
        />
        <FAQItem
          question="How do I update my equipment details?"
          answer="Navigate to Profile → Equipment, select the item, and tap the edit icon to update serial numbers, brand, or model info."
        />
      </View>

      {/* EMERGENCY SUPPORT */}
      <View style={styles.emergencyWrapper}>
        <View style={styles.emergencyGlow} />
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyIconCircle}>
            <MaterialCommunityIcons
              name="alert-decagram"
              size={28}
              color="#fca5a5"
            />
          </View>
          <Text style={styles.emergencyTitle}>Emergency Support</Text>
          <Text style={styles.emergencyText}>
            For urgent equipment breakdowns or critical service failures,
            contact our emergency line immediately.
          </Text>
          <Pressable
            style={styles.emergencyButton}
            onPress={callSupport}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
          >
            <Ionicons name="call" size={16} color="#fff" />
            <Text style={styles.emergencyButtonText}>Call Emergency Line</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scrollContent: {
    paddingTop:
      Platform.OS === "ios" ? 60 : (StatusBar.currentHeight || 40) + 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(167,139,250,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.2)",
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 320,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  actionCard: {
    backgroundColor: "rgba(30,41,59,0.6)",
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    gap: 14,
  },
  actionCardPressed: {
    backgroundColor: "rgba(30,41,59,0.8)",
    transform: [{ scale: 0.98 }],
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    color: "#f1f5f9",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  actionSub: {
    color: "#64748b",
    fontSize: 13,
  },
  faqCard: {
    backgroundColor: "rgba(30,41,59,0.4)",
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  faqCardActive: {
    backgroundColor: "rgba(30,41,59,0.7)",
    borderColor: "rgba(167,139,250,0.15)",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingRight: 14,
  },
  question: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    paddingRight: 12,
    lineHeight: 22,
  },
  answerContainer: {
    overflow: "hidden",
  },
  answer: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  emergencyWrapper: {
    position: "relative",
    marginBottom: 20,
  },
  emergencyGlow: {
    position: "absolute",
    top: -10,
    left: "10%",
    right: "10%",
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(220,38,38,0.25)",
    blurRadius: 40,
    opacity: 0.6,
  },
  emergencyCard: {
    backgroundColor: "rgba(30,41,59,0.8)",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
    overflow: "hidden",
  },
  emergencyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: "rgba(239,68,68,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
  emergencyTitle: {
    color: "#fecaca",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  emergencyText: {
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 22,
    fontSize: 14,
    marginBottom: 20,
    maxWidth: 280,
  },
  emergencyButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  emergencyButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
