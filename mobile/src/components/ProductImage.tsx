import { Image, StyleSheet, View } from "react-native";
import { Leaf } from "lucide-react-native";
import { getProductThumbnail } from "@/lib/product";
import { Product } from "@/types/domain";
import { useThemeStore } from "@/store/themeStore";

export function ProductImage({
  product,
  size = "medium",
}: {
  product: Product;
  size?: "small" | "medium" | "large";
}) {
  const colors = useThemeStore((state) => state.colors);
  const image = getProductThumbnail(product);
  const dimension =
    size === "small" ? styles.small : size === "large" ? styles.large : null;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.mutedSurface }, dimension]}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      ) : (
        <Leaf color={colors.primary} size={28} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    aspectRatio: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: "100%" },
  small: { width: 82, height: 82, aspectRatio: undefined },
  large: { width: "100%" },
});
