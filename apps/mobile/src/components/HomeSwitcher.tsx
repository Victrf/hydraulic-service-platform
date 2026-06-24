import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutChangeEvent,
} from "react-native";
import { useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const TABS = ["request", "create", "subscription", "product"];

export default function HomeSwitcher() {
  const [activeTab, setActiveTab] = useState("request");
  const [tabWidth, setTabWidth] = useState(0);

  const translateX = useSharedValue(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width / TABS.length;
    setTabWidth(width);
  };

  const handlePress = (index: number, tab: string) => {
    setActiveTab(tab);
    translateX.value = withTiming(index * tabWidth, { duration: 260 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      {/* TAB BAR */}
      <View style={styles.tabBar} onLayout={onLayout}>
        {/* ACTIVE SLIDER */}
        {tabWidth > 0 && (
          <Animated.View
            style={[styles.slider, { width: tabWidth }, animatedStyle]}
          />
        )}

        {TABS.map((tab, index) => {
          const isActive = activeTab === tab;

          return (
            <Pressable
              key={tab}
              onPress={() => handlePress(index, tab)}
              style={styles.tabItem}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        {activeTab === "request" && (
          <Text style={styles.placeholder}>Request overview</Text>
        )}
        {activeTab === "create" && (
          <Text style={styles.placeholder}>Create request</Text>
        )}
        {activeTab === "subscription" && (
          <Text style={styles.placeholder}>Subscription summary</Text>
        )}
        {activeTab === "product" && (
          <Text style={styles.placeholder}>Product preview</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 16,
  },

  /* 🔥 TAB BAR (reduced height) */
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#0a0f1a",
    borderRadius: 14,

    paddingHorizontal: 6,
    paddingVertical: 6, // ✅ reduced (was 10)

    position: "relative",
    overflow: "hidden",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10, // ✅ reduced (was 14)
    zIndex: 2,
  },

  tabText: {
    color: "#64748b",
    fontSize: 12, // ✅ slightly tighter
    fontWeight: "500",
    textTransform: "capitalize",
    letterSpacing: 0.2,
  },

  activeTabText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  /* 🔥 SLIDER (match new height) */
  slider: {
    position: "absolute",

    top: 4, // ✅ reduced
    bottom: 4, // ✅ reduced

    left: 0,
    backgroundColor: "#172033",
    borderRadius: 10,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  /* 🔥 CONTENT */
  content: {
    marginTop: 16,
    backgroundColor: "#0b1220",
    borderRadius: 18,
    padding: 18,
    minHeight: 160,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  placeholder: {
    color: "#9ca3af",
    fontSize: 13,
    lineHeight: 18,
  },
});
