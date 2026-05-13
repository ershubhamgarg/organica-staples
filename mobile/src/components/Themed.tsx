import { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useThemeStore } from "@/store/themeStore";

export function Screen({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }, style]}>
      {children}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function AppText({
  children,
  variant = "body",
  style,
  ...props
}: {
  children: ReactNode;
  variant?: "eyebrow" | "title" | "heading" | "body" | "small" | "price";
  style?: StyleProp<TextStyle>;
} & TextProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <Text
      style={[
        styles[variant],
        {
          color:
            variant === "eyebrow"
              ? colors.primary
              : variant === "small"
                ? colors.mutedText
                : colors.text,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function AppInput(props: TextInputProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <TextInput
      placeholderTextColor={colors.mutedText}
      {...props}
      style={[
        styles.input,
        {
          color: colors.text,
          borderColor: colors.border,
          backgroundColor: colors.mutedSurface,
        },
        props.style,
      ]}
    />
  );
}

export function AppButton({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
}) {
  const colors = useThemeStore((state) => state.colors);
  const isPrimary = variant === "primary";
  const isGhost = variant === "ghost";

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isGhost
            ? "transparent"
            : isPrimary
              ? colors.primary
              : colors.mutedSurface,
          borderColor: colors.border,
          opacity: disabled ? 0.55 : pressed ? 0.82 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : colors.primary} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            { color: isPrimary ? "#fff" : colors.primary },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  card: {
    borderWidth: 1,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 2,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: { fontSize: 42, lineHeight: 44, fontWeight: "700" },
  heading: { fontSize: 26, lineHeight: 31, fontWeight: "700" },
  body: { fontSize: 15, lineHeight: 23 },
  small: { fontSize: 12, lineHeight: 18 },
  price: { fontSize: 28, fontWeight: "800" },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  button: {
    borderWidth: 1,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});
