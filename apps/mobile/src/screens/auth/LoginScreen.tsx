import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../api/client";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { socket } from "../../services/socket";

const { width } = Dimensions.get("window");

const slides = [
  {
    image: require("../../assets/images/bg3.jpg"),
    title: "Heavy Equipment. Simplified.",
    subtitle: "Manage, track and deploy machinery efficiently",
  },
  {
    image: require("../../assets/images/bg3.jpg"),
    title: "Built for Field Operations",
    subtitle: "Real-time updates from your workforce",
  },
  {
    image: require("../../assets/images/bg3.jpg"),
    title: "Powering Industrial Workflows",
    subtitle: "Reliable tools for modern infrastructure",
  },
];

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [index, setIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const textOpacity = useRef(new Animated.Value(1)).current;
  const textTranslate = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState<"email" | "password" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Animated.spring(logoScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (index + 1) % slides.length;

      Animated.timing(translateX, {
        toValue: -nextIndex * width,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      textOpacity.setValue(0);
      textTranslate.setValue(20);

      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslate, {
          toValue: 0,
          duration: 500,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setIndex(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [index]);

  const login = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/login", { email, password });

      const token = res.data.access_token;

      await AsyncStorage.setItem("token", token);

      // Connect socket
      socket.connect();

      // Join this user's room
      socket.emit("join", res.data.user.id);

      const decoded = jwtDecode<any>(token);

      if (decoded.role === "admin") {
        navigation.replace("Admin");
      } else if (decoded.role === "technician") {
        navigation.replace("Technician");
      } else {
        navigation.replace("Customer");
      }
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.root}>
        {/* 🔥 FIXED: flexible layout */}
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            <Animated.View
              style={[
                styles.carouselContainer,
                { transform: [{ translateX }] },
              ]}
            >
              {slides.map((item, i) => (
                <View key={i} style={styles.slide}>
                  <Image source={item.image} style={styles.carouselImage} />
                  <Animated.View
                    style={[
                      styles.slideTextContainer,
                      {
                        opacity: textOpacity,
                        transform: [{ translateY: textTranslate }],
                      },
                    ]}
                  >
                    <Text style={styles.slideTitle}>{item.title}</Text>
                    <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
                  </Animated.View>
                </View>
              ))}
            </Animated.View>
          </View>

          <View style={styles.gradientOverlay} />

          <Animated.View
            style={[
              styles.brandContainer,
              { transform: [{ scale: logoScale }] },
            ]}
          >
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
            />
            <Text style={styles.brandText}>Krania</Text>
          </Animated.View>
        </View>

        <BlurView
          intensity={90}
          tint="dark"
          style={[styles.bottomSheet, { paddingBottom: 18 + insets.bottom }]}
        >
          <KeyboardAwareScrollView
            enableOnAndroid
            extraScrollHeight={60}
            keyboardOpeningTime={0}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "flex-end",
              paddingBottom: 30,
            }}
          >
            <Text style={styles.title}>Welcome back</Text>

            <Text style={[styles.subtitle, { marginBottom: 10 }]}>
              Login to continue
            </Text>

            {error ? (
              <Text style={{ color: "#ef4444", marginBottom: 10 }}>
                {error}
              </Text>
            ) : null}

            <View
              style={[
                styles.inputWrapper,
                focused === "email" && styles.inputFocused,
              ]}
            >
              <TextInput
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="Email address"
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />
            </View>

            <View
              style={[
                styles.inputWrapper,
                focused === "password" && styles.inputFocused,
              ]}
            >
              <TextInput
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={login}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={login}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
          </KeyboardAwareScrollView>
        </BlurView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },

  imageContainer: { flex: 1 },

  imageWrapper: { flex: 1, overflow: "hidden" },
  carouselContainer: { flexDirection: "row", width: width * slides.length },
  slide: { width },
  carouselImage: { width, height: "112%" },

  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)", // lighter global tint
    borderBottomWidth: 180, // slightly reduced spread
    borderBottomColor: "rgba(0,0,0,0.45)", // softer fade
  },

  brandContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  logo: { width: 32, height: 32 },

  brandText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 8,
    fontWeight: "600",
  },

  slideTextContainer: {
    position: "absolute",
    bottom: 140,
    left: 20,
    right: 20,
  },

  slideTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.3, // 🔥 tighter feel
  },

  slideSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginTop: 4,
  },

  // ✅ refined bottom sheet
  bottomSheet: {
    minHeight: 260,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    backgroundColor: "rgba(15,15,15,0.75)", // 🔥 better depth
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  title: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 4,
  },

  subtitle: {
    color: "#ffffff",
    fontSize: 13,
    marginBottom: 18,
  },

  inputWrapper: {
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)", // 🔥 subtle fill
  },

  inputFocused: {
    borderColor: "#3b82f6",
    backgroundColor: "rgba(59,130,246,0.12)",
  },

  input: {
    color: "#fff",
    paddingVertical: 14,
    fontSize: 14,
  },

  button: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 6,
    shadowColor: "#3b82f6",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
