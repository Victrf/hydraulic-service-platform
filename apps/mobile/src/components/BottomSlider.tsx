import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

// Background image map per slide type (UNCHANGED, but no longer used directly)
const BG_IMAGES: Record<string, any> = {
  announcement: {
    uri: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
  },
  subscription: {
    uri: "https://images.unsplash.com/photo-1604079628040-94301bb21b91?w=800&q=80",
  },
  "no-subscription": {
    uri: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
  },
  plan: {
    uri: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  },
};

// Accent colors per slide type (UNCHANGED)
const ACCENTS: Record<string, string> = {
  announcement: "#2563eb",
  subscription: "#10b981",
  "no-subscription": "#ef4444",
  plan: "#10b981",
};

export default function BottomSlider({ slides, bottomRef }: any) {
  if (!Array.isArray(slides) || slides.length === 0) return null;

  return (
    <View style={styles.bottomContainer}>
      {/* BACKGROUND */}
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1668681919287-7367677cdc4c?w=800&q=80",
        }}
        style={StyleSheet.absoluteFill}
        imageStyle={styles.containerBgImage}
      />

      {/* OVERLAY */}
      <LinearGradient
        colors={["rgba(2,6,23,0.6)", "rgba(2,6,23,0.95)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.FlatList
        ref={bottomRef}
        data={slides}
        keyExtractor={(item, i) => `${item.type}-${i}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          switch (item.type) {
            case "announcement":
              return (
                <SlideWrapper>
                  <SlideHeader
                    icon="megaphone-outline"
                    color={ACCENTS.announcement}
                    label="Announcement"
                  />
                  <Text style={styles.bottomTitle}>{item.data.title}</Text>
                  <Text style={styles.bottomText}>{item.data.content}</Text>
                </SlideWrapper>
              );

            case "subscription":
              return (
                <SlideWrapper accent={ACCENTS.subscription}>
                  <SlideHeader
                    icon="card-outline"
                    color={ACCENTS.subscription}
                    label="Your Plan"
                  />

                  <Text style={styles.bottomTitle}>{item.data.plan.name}</Text>

                  <View style={styles.detailRow}>
                    <Text style={styles.planDetail}>
                      {item.data.plan.intervalMonths} Month
                    </Text>
                    <View style={styles.dot} />
                    <Text style={styles.planDetail}>
                      Next: {new Date(item.data.nextVisitDate).toDateString()}
                    </Text>
                  </View>
                </SlideWrapper>
              );

            case "no-subscription":
              return (
                <SlideWrapper accent={ACCENTS["no-subscription"]}>
                  <SlideHeader
                    icon="alert-circle-outline"
                    color={ACCENTS["no-subscription"]}
                    label="No Active Plan"
                  />

                  <Text style={styles.bottomTitle}>
                    You don't have a subscription
                  </Text>
                  <Text style={styles.bottomText}>
                    Choose a plan below to get started
                  </Text>
                </SlideWrapper>
              );

            case "plan":
              return (
                <SlideWrapper accent={ACCENTS.plan}>
                  <SlideHeader
                    icon="pricetag-outline"
                    color={ACCENTS.plan}
                    label="Available Plan"
                  />

                  <Text style={styles.bottomTitle}>{item.data.name}</Text>

                  <View style={styles.detailRow}>
                    <Text style={styles.planDetail}>
                      {item.data.intervalMonths} Month
                    </Text>
                    <View style={styles.dot} />
                    <Text style={styles.planDetail}>
                      Includes scheduled visits
                    </Text>
                  </View>
                </SlideWrapper>
              );

            default:
              return null;
          }
        }}
      />
    </View>
  );
}

const SlideWrapper = ({ children, accent }: any) => (
  <View style={[styles.bottomSlide, { width: width - 32 }]}>
    <LinearGradient
      colors={["rgba(2,6,23,0.55)", "rgba(2,6,23,0.92)"]}
      style={styles.gradientOverlay}
    >
      <View style={[styles.accentBar, accent && { backgroundColor: accent }]} />
      {children}
    </LinearGradient>
  </View>
);

const SlideHeader = ({ icon, color, label }: any) => (
  <View style={styles.slideHeader}>
    <Ionicons name={icon} size={14} color={color} />
    <Text style={[styles.slideLabel, { color }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#020617",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    overflow: "hidden", // 🔥 required for rounded bg
  },

  // 🔥 NEW
  containerBgImage: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  bottomSlide: {
    height: 100,
    justifyContent: "center",
    borderRadius: 16,
    overflow: "hidden",
  },

  gradientOverlay: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "center",
    borderRadius: 16,
  },

  accentBar: {
    position: "absolute",
    left: 0,
    top: 16,
    bottom: 16,
    width: 3,
    borderRadius: 4,
    backgroundColor: "#2563eb",
  },

  slideHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
    paddingLeft: 12,
  },

  slideLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#94a3b8",
  },

  bottomTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    paddingLeft: 12,
    letterSpacing: 0.1,
  },

  bottomText: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 3,
    paddingLeft: 12,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
    paddingLeft: 12,
  },

  planDetail: {
    fontSize: 11,
    color: "#94a3b8",
  },

  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#475569",
  },
});
