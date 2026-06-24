import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  PanResponder,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const slides = [
  {
    title: "Heavy Equipment. Simplified.",
    subtitle: "Manage, track and deploy machinery efficiently",
    colors: ["#0f172a", "#1e3a8a"],
  },
  {
    title: "Built for Field Operations",
    subtitle: "Real-time updates from your workforce",
    colors: ["#020617", "#4f46e5"],
  },
  {
    title: "Powering Industrial Workflows",
    subtitle: "Reliable tools for modern infrastructure",
    colors: ["#020617", "#0ea5e9"],
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const [index, setIndex] = useState(0);

  const translateX = useRef(new Animated.Value(0)).current;
  const bgTranslateX = useRef(new Animated.Value(0)).current;

  const textOpacity = useRef(new Animated.Value(1)).current;
  const textTranslate = useRef(new Animated.Value(0)).current;

  const screenOpacity = useRef(new Animated.Value(1)).current;

  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

  // Floating blobs
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float1, {
          toValue: 20,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(float1, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float2, {
          toValue: -20,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(float2, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Auto slide
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = (index + 1) % slides.length;

      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -next * width,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(bgTranslateX, {
          toValue: -next * width * 0.6,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();

      textOpacity.setValue(0);
      textTranslate.setValue(20);

      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          delay: 150,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslate, {
          toValue: 0,
          duration: 400,
          delay: 150,
          useNativeDriver: true,
        }),
      ]).start();

      setIndex(next);
    }, 4000);

    return () => clearTimeout(timer);
  }, [index]);

  // Swipe
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,

      onPanResponderMove: (_, g) => {
        translateX.setValue(-index * width + g.dx);
        bgTranslateX.setValue((-index * width + g.dx) * 0.6);
      },

      onPanResponderRelease: (_, g) => {
        let newIndex = index;

        if (g.dx < -50 && index < slides.length - 1) newIndex++;
        if (g.dx > 50 && index > 0) newIndex--;

        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -newIndex * width,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(bgTranslateX, {
            toValue: -newIndex * width * 0.6,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        setIndex(newIndex);
      },
    })
  ).current;

  const handleStart = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");

    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      navigation.replace("Login");
    });
  };

  return (
    <Animated.View style={[styles.root, { opacity: screenOpacity }]}>
      {/* TOP FADE */}
      <View style={styles.topFade} />

      {/* BACKGROUND */}
      <Animated.View
        style={[
          styles.bgCarousel,
          { transform: [{ translateX: bgTranslateX }] },
        ]}
      >
        {slides.map((slide, i) => (
          <View key={i} style={{ width, height: "100%" }}>
            <LinearGradient
              colors={[slide.colors[0], slide.colors[1], "#000"]}
              locations={[0, 0.6, 1]}
              style={StyleSheet.absoluteFillObject}
            />

            <Animated.View
              style={[styles.circle1, { transform: [{ translateY: float1 }] }]}
            />
            <Animated.View
              style={[styles.circle2, { transform: [{ translateY: float2 }] }]}
            />
          </View>
        ))}
      </Animated.View>

      {/* TEXT */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.carousel, { transform: [{ translateX }] }]}
      >
        {slides.map((item, i) => (
          <View key={i} style={styles.slide}>
            <Animated.View
              style={{
                opacity: textOpacity,
                transform: [{ translateY: textTranslate }],
              }}
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </Animated.View>
          </View>
        ))}
      </Animated.View>

      {/* PAGINATION */}
      <View style={styles.pagination}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, index === i && styles.activeDot]} />
        ))}
      </View>

      {/* BUTTON */}
      <TouchableOpacity onPress={handleStart}>
        <LinearGradient
          colors={["#3b82f6", "#6366f1"]}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },

  topFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  bgCarousel: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    width: width * slides.length,
  },

  circle1: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#3b82f6",
    opacity: 0.25,
    top: 80,
    left: -60,
    shadowColor: "#3b82f6",
    shadowOpacity: 0.8,
    shadowRadius: 60,
  },

  circle2: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#6366f1",
    opacity: 0.25,
    bottom: 140,
    right: -60,
    shadowColor: "#6366f1",
    shadowOpacity: 0.8,
    shadowRadius: 60,
  },

  carousel: {
    flexDirection: "row",
    width: width * slides.length,
    flex: 1,
  },

  slide: {
    width,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: "rgba(255,255,255,0.75)",
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },

  pagination: {
    position: "absolute",
    bottom: 110,
    alignSelf: "center",
    flexDirection: "row",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 4,
  },

  activeDot: {
    width: 22,
    backgroundColor: "#fff",
    borderRadius: 6,
  },

  button: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#6366f1",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 6,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});