import React, { useEffect, useRef } from "react";
import { Modal, View, StyleSheet, Animated, Pressable } from "react-native";

interface AppModalProps {
  visible: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  closeOnBackdrop?: boolean;

  // NEW
  variant?: "center" | "bottom";
}

export default function AppModal({
  visible,
  children,
  onClose,
  closeOnBackdrop = false,
  variant = "center",
}: AppModalProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  const scale = useRef(new Animated.Value(0.9)).current;

  const translateY = useRef(
    new Animated.Value(variant === "bottom" ? 350 : 40),
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),

        ...(variant === "center"
          ? [
              Animated.spring(scale, {
                toValue: 1,
                friction: 7,
                useNativeDriver: true,
              }),
            ]
          : []),

        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacity.setValue(0);

      scale.setValue(0.9);

      translateY.setValue(variant === "bottom" ? 350 : 40);
    }
  }, [visible, variant]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Pressable
        style={[styles.backdrop, variant === "bottom" && styles.bottomBackdrop]}
        disabled={!closeOnBackdrop}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.card,
            variant === "bottom" && styles.bottomCard,
            {
              opacity,
              transform: [
                ...(variant === "center" ? [{ scale }] : []),
                { translateY },
              ],
            },
          ]}
        >
          {children}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  bottomBackdrop: {
    justifyContent: "flex-end",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  card: {
    width: "88%",
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  bottomCard: {
    width: "100%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: 36,
  },
});
