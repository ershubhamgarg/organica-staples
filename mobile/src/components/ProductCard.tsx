import { Pressable, StyleSheet, View } from "react-native";
import { Star } from "lucide-react-native";
import { ProductImage } from "@/components/ProductImage";
import { AppButton, AppText, Card } from "@/components/Themed";
import {
  getDiscountPercent,
  getDiscountedPrice,
  hasProductDiscount,
} from "@/lib/pricing";
import { useCartStore } from "@/store/cartStore";
import { useThemeStore } from "@/store/themeStore";
import { useUserStore } from "@/store/userStore";
import { Product } from "@/types/domain";

export function ProductCard({
  product,
  onPress,
}: {
  product: Product;
  onPress: () => void;
}) {
  const colors = useThemeStore((state) => state.colors);
  const addToCart = useCartStore((state) => state.addToCart);
  const user = useUserStore((state) => state.user);
  const price = getDiscountedPrice(product);
  const hasDiscount = hasProductDiscount(product);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
      <Card style={styles.card}>
        <View>
          <ProductImage product={product} />
          {hasDiscount && (
            <View style={[styles.badge, { backgroundColor: colors.gold }]}>
              <AppText style={{ color: "#211B12", fontSize: 10, fontWeight: "800" }}>
                {getDiscountPercent(product)}% OFF
              </AppText>
            </View>
          )}
        </View>
        <View style={styles.rating}>
          {[0, 1, 2, 3, 4].map((star) => (
            <Star
              key={star}
              size={12}
              color={colors.gold}
              fill={star < Math.round(product.rating || 0) ? colors.gold : "transparent"}
            />
          ))}
          <AppText variant="small">
            {product.rating ? product.rating.toFixed(1) : "0.0"} ({product.review_count || 0})
          </AppText>
        </View>
        <AppText variant="heading" style={styles.name}>
          {product.name}
        </AppText>
        <AppText variant="small" style={styles.description} numberOfLines={2}>
          {product.description}
        </AppText>
        <View style={styles.priceRow}>
          <AppText variant="body" style={{ color: colors.primary, fontWeight: "800" }}>
            ₹{price.toFixed(2)}
          </AppText>
          <AppText variant="small">/ {product.weight}</AppText>
        </View>
        <AppButton
          label="Quick add"
          onPress={() => addToCart(product, 1, user?.id)}
          variant="secondary"
        />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, padding: 12 },
  badge: { position: "absolute", left: 10, top: 10, paddingHorizontal: 9, paddingVertical: 5 },
  rating: { flexDirection: "row", alignItems: "center", gap: 3 },
  name: { fontSize: 20, lineHeight: 24 },
  description: { minHeight: 36 },
  priceRow: { flexDirection: "row", gap: 5, alignItems: "baseline" },
});
