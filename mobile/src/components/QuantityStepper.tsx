import { Minus, Plus } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useThemeStore } from "@/store/themeStore";

export function QuantityStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (quantity: number) => void;
}) {
  const colors = useThemeStore((state) => state.colors);

  return (
    <View style={[styles.wrap, { borderColor: colors.border }]}>
      <Pressable style={styles.button} onPress={() => onChange(value - 1)}>
        <Minus size={16} color={colors.primary} />
      </Pressable>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Pressable style={styles.button} onPress={() => onChange(value + 1)}>
        <Plus size={16} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  button: {
    width: 44,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  value: { minWidth: 34, textAlign: "center", fontWeight: "800", fontSize: 16 },
});
