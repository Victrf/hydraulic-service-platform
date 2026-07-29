import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  Alert,
  Animated,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../api/client";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function CreateCompanyScreen() {
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState("company");
  const [logo, setLogo] = useState<any | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPosition, setContactPosition] = useState("");

  const [escalatingName, setEscalatingName] = useState("");
  const [escalatingEmail, setEscalatingEmail] = useState("");
  const [escalatingPhone, setEscalatingPhone] = useState("");
  const [escalatingPosition, setEscalatingPosition] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const flatListRef = useRef<FlatList>(null);
  const currentIndex = useRef(0);

  const slides = [
    {
      id: "1",
      title: "Create Company",
      subtitle: "Start your system foundation",
      image:
        "https://images.unsplash.com/photo-1664575602276-acd073f104c1?w=600",
    },
    {
      id: "2",
      title: "Add Equipment",
      subtitle: "Attach machines to company",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600",
    },
    {
      id: "3",
      title: "Assign Users",
      subtitle: "Technicians & staff",
      image:
        "https://plus.unsplash.com/premium_photo-1681487178876-a1156952ec60?w=600",
    },
    {
      id: "4",
      title: "Manage Requests",
      subtitle: "Track operations",
      image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=600",
    },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const interval = setInterval(() => {
      currentIndex.current =
        currentIndex.current < slides.length - 1 ? currentIndex.current + 1 : 0;
      flatListRef.current?.scrollToIndex({
        index: currentIndex.current,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const pickLogo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: false,
    });
    if (!result.canceled) {
      setLogo(result.assets[0]);
    }
  };

  const createCompany = async () => {
    if (!name.trim()) {
      setError("Company name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("address", address.trim());
      formData.append("phone", phone.trim());

      formData.append("contactName", contactName.trim());
      formData.append("contactEmail", contactEmail.trim());
      formData.append("contactPhone", contactPhone.trim());
      formData.append("contactPosition", contactPosition.trim());

      formData.append("escalatingName", escalatingName.trim());
      formData.append("escalatingEmail", escalatingEmail.trim());
      formData.append("escalatingPhone", escalatingPhone.trim());
      formData.append("escalatingPosition", escalatingPosition.trim());

      if (logo) {
        const fileName = logo.uri.split("/").pop();
        formData.append("logo", {
          uri: logo.uri,
          name: fileName || "company-logo.jpg",
          type: "image/jpeg",
        } as any);
      }

      await api.post("/companies", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Success", "Company created");

      setName("");
      setEmail("");
      setAddress("");
      setPhone("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setContactPosition("");
      setEscalatingName("");
      setEscalatingEmail("");
      setEscalatingPhone("");
      setEscalatingPosition("");
      setLogo(null);
      navigation.goBack();
    } catch (err: any) {
      console.log("CREATE COMPANY ERROR:", err?.response?.data || err.message);
      setError(err?.response?.data?.message || "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "company", label: "Company", icon: "business-outline" },
    { id: "contact", label: "Contact", icon: "person-outline" },
    { id: "escalating", label: "Escalation", icon: "alert-circle-outline" },
  ];

  const renderInput = (
    placeholder: string,
    value: string,
    onChange: (val: string) => void,
    fieldKey: string,
    keyboardType: any = "default",
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{placeholder}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#475569"
        style={[styles.input, focused === fieldKey && styles.inputFocused]}
        value={value}
        onFocus={() => setFocused(fieldKey)}
        onBlur={() => setFocused(null)}
        onChangeText={(val) => {
          onChange(val);
          if (error) setError("");
        }}
        keyboardType={keyboardType}
        autoCapitalize={fieldKey.includes("email") ? "none" : "sentences"}
      />
    </View>
  );

  return (
    <View style={styles.screen}>
      {/* Background Accents */}
      <View style={styles.bgAccent} />
      <View style={styles.bgAccent2} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.headerTag}>ONBOARDING</Text>
          <Text style={styles.title}>Create Company</Text>
          <Text style={styles.subtitle}>
            Set up a new company with contacts and escalation details
          </Text>
        </Animated.View>

        {/* IMAGE SLIDER */}
        <Animated.View
          style={[
            styles.sliderContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <FlatList
            ref={flatListRef}
            data={slides}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / (width - 40),
              );
              currentIndex.current = index;
            }}
            getItemLayout={(_, index) => ({
              length: width - 40,
              offset: (width - 40) * index,
              index,
            })}
            renderItem={({ item }) => (
              <View style={[styles.slide, { width: width - 40 }]}>
                <Image source={{ uri: item.image }} style={styles.slideImage} />
                <View style={styles.slideOverlay} />
                <View style={styles.slideContent}>
                  <View style={styles.slideIconBox}>
                    <Ionicons name="shield-checkmark" size={20} color="#fff" />
                  </View>
                  <Text style={styles.slideTitle}>{item.title}</Text>
                  <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            )}
          />
          {/* Slide Indicators */}
          <View style={styles.indicators}>
            {slides.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.indicator,
                  idx === currentIndex.current && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* LOGO UPLOAD */}
        <Animated.View
          style={[
            styles.glassCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.cardLabel}>Company Branding</Text>
          <Pressable
            style={({ pressed }) => [
              styles.logoBox,
              pressed && styles.logoBoxPressed,
              logo && styles.logoBoxFilled,
            ]}
            onPress={pickLogo}
          >
            {logo ? (
              <Image source={{ uri: logo.uri }} style={styles.logoPreview} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <View style={styles.logoIconBox}>
                  <Ionicons name="camera-outline" size={28} color="#818cf8" />
                </View>
                <Text style={styles.logoText}>Upload Company Logo</Text>
                <Text style={styles.logoSubtext}>Tap to select an image</Text>
              </View>
            )}
          </Pressable>
        </Animated.View>

        {/* FORM CARD */}
        <Animated.View
          style={[
            styles.glassCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.cardLabel}>Company Details</Text>

          {/* TABS */}
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <Pressable
                key={tab.id}
                style={styles.tab}
                onPress={() => setActiveTab(tab.id)}
              >
                <View style={styles.tabContent}>
                  <Ionicons
                    name={tab.icon as any}
                    size={16}
                    color={activeTab === tab.id ? "#818cf8" : "#64748b"}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab.id && styles.tabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </View>
                {activeTab === tab.id && (
                  <View style={styles.activeUnderline} />
                )}
              </Pressable>
            ))}
          </View>

          {/* COMPANY TAB - VERTICAL STACK */}
          {activeTab === "company" && (
            <View style={styles.formStack}>
              {renderInput("Company Name *", name, setName, "name")}
              {renderInput(
                "Email Address",
                email,
                setEmail,
                "email",
                "email-address",
              )}
              {renderInput("Physical Address", address, setAddress, "address")}
              {renderInput(
                "Phone Number",
                phone,
                setPhone,
                "phone",
                "phone-pad",
              )}
            </View>
          )}

          {/* CONTACT TAB - VERTICAL STACK */}
          {activeTab === "contact" && (
            <View style={styles.formStack}>
              {renderInput(
                "Contact Name",
                contactName,
                setContactName,
                "contactName",
              )}
              {renderInput(
                "Contact Email",
                contactEmail,
                setContactEmail,
                "contactEmail",
                "email-address",
              )}
              {renderInput(
                "Contact Phone",
                contactPhone,
                setContactPhone,
                "contactPhone",
                "phone-pad",
              )}
              {renderInput(
                "Position / Role",
                contactPosition,
                setContactPosition,
                "contactPosition",
              )}
            </View>
          )}

          {/* ESCALATING TAB - VERTICAL STACK */}
          {activeTab === "escalating" && (
            <View style={styles.formStack}>
              {renderInput(
                "Escalation Name",
                escalatingName,
                setEscalatingName,
                "escalatingName",
              )}
              {renderInput(
                "Escalation Email",
                escalatingEmail,
                setEscalatingEmail,
                "escalatingEmail",
                "email-address",
              )}
              {renderInput(
                "Escalation Phone",
                escalatingPhone,
                setEscalatingPhone,
                "escalatingPhone",
                "phone-pad",
              )}
              {renderInput(
                "Position / Role",
                escalatingPosition,
                setEscalatingPosition,
                "escalatingPosition",
              )}
            </View>
          )}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠</Text>
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}
        </Animated.View>

        {/* CREATE BUTTON */}
        <Pressable
          disabled={loading}
          style={({ pressed }) => [
            styles.btn,
            pressed && styles.btnPressed,
            loading && styles.btnLoading,
          ]}
          onPress={createCompany}
        >
          <View style={styles.btnInner}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.btnText}>Create Company</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          </View>
          <View style={styles.btnGlow} />
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#030712",
  },

  bgAccent: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#4f46e5",
    opacity: 0.15,
  },

  bgAccent2: {
    position: "absolute",
    bottom: -80,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#7c3aed",
    opacity: 0.12,
  },

  scroll: {
    flex: 1,
  },

  container: {
    padding: 20,
    paddingTop: 60,
  },

  header: {
    marginBottom: 24,
  },

  headerTag: {
    color: "#6366f1",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  title: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 8,
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: "90%",
  },

  /* SLIDER */
  sliderContainer: {
    marginBottom: 20,
  },

  slide: {
    height: 160,
    borderRadius: 24,
    overflow: "hidden",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },

  slideImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  slideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.55)",
  },

  slideContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 20,
  },

  slideIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(99, 102, 241, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  slideTitle: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: -0.3,
  },

  slideSubtitle: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "500",
  },

  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    gap: 6,
  },

  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },

  indicatorActive: {
    width: 20,
    backgroundColor: "#6366f1",
    borderRadius: 3,
  },

  /* CARDS */
  glassCard: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },

  cardLabel: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: 0.5,
  },

  /* LOGO */
  logoBox: {
    height: 160,
    borderRadius: 20,
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    borderWidth: 2,
    borderColor: "rgba(99, 102, 241, 0.15)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  logoBoxPressed: {
    backgroundColor: "rgba(2, 6, 23, 0.7)",
    borderColor: "rgba(99, 102, 241, 0.3)",
  },

  logoBoxFilled: {
    borderStyle: "solid",
    borderColor: "rgba(99, 102, 241, 0.3)",
  },

  logoPlaceholder: {
    alignItems: "center",
  },

  logoIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
  },

  logoText: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },

  logoSubtext: {
    color: "#64748b",
    fontSize: 13,
  },

  logoPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  /* TABS */
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "rgba(2, 6, 23, 0.4)",
    borderRadius: 16,
    padding: 4,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
  },

  tabContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  tabText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
  },

  tabTextActive: {
    color: "#e2e8f0",
    fontWeight: "700",
  },

  activeUnderline: {
    position: "absolute",
    bottom: 0,
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: "#6366f1",
    borderRadius: 2,
  },

  /* FORM STACK - VERTICAL LAYOUT */
  formStack: {
    flexDirection: "column",
    width: "100%",
  },

  /* INPUTS */
  inputGroup: {
    marginBottom: 14,
    width: "100%",
  },

  inputLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  input: {
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    color: "#f1f5f9",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.15)",
    fontSize: 15,
    fontWeight: "500",
    width: "100%",
  },

  inputFocused: {
    borderColor: "#6366f1",
    backgroundColor: "rgba(2, 6, 23, 0.7)",
  },

  /* ERROR */
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },

  errorIcon: {
    marginRight: 8,
    fontSize: 14,
  },

  error: {
    color: "#f87171",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },

  /* BUTTON */
  btn: {
    marginTop: 8,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
  },

  btnPressed: {
    transform: [{ scale: 0.98 }],
  },

  btnLoading: {
    opacity: 0.8,
  },

  btnInner: {
    backgroundColor: "#4f46e5",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },

  btnGlow: {
    position: "absolute",
    top: 0,
    left: "20%",
    right: "20%",
    height: "50%",
    backgroundColor: "#6366f1",
    opacity: 0.3,
    borderRadius: 18,
    zIndex: -1,
  },
});
