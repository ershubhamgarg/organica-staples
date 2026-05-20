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
  const isAvailable = product.available !== false;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <Card style={styles.card}>
        <View>
          <ProductImage product={product} />
          {hasDiscount && isAvailable && (
            <View style={[styles.badge, { backgroundColor: colors.gold }]}>
              <AppText
                style={{ color: "#211B12", fontSize: 10, fontWeight: "800" }}
              >
                {getDiscountPercent(product)}% OFF
              </AppText>
            </View>
          )}
          {!isAvailable && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <AppText
                style={{ color: "white", fontSize: 10, fontWeight: "800" }}
              >
                SOON
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
              fill={
                star < Math.round(product.rating || 0)
                  ? colors.gold
                  : "transparent"
              }
            />
          ))}
          <AppText variant="small">
            {product.rating ? product.rating.toFixed(1) : "0.0"} (
            {product.review_count || 0})
          </AppText>
        </View>
        <AppText variant="heading" style={styles.name}>
          {product.name}
        </AppText>
        <AppText variant="small" style={styles.description} numberOfLines={2}>
          {product.description}
        </AppText>
        <View style={styles.priceRow}>
          {isAvailable ? (
            <>
              <AppText
                variant="body"
                style={{ color: colors.primary, fontWeight: "800" }}
              >
                ₹{price.toFixed(2)}
              </AppText>
              <AppText variant="small">/ {product.weight}</AppText>
            </>
          ) : (
            <View style={styles.tapeWrapper}>
              <AppText variant="body" style={{ color: colors.primary }}>
                ₹
              </AppText>
              <View style={styles.tapeContainer}>
                <AppText
                  variant="body"
                  style={{ color: colors.primary, opacity: 0.25 }}
                >
                  {product.price.toFixed(2)}
                </AppText>
                <View style={[styles.tape, { backgroundColor: colors.gold }]} />
              </View>
            </View>
          )}
        </View>
        <AppButton
          label={isAvailable ? "Quick add" : "Available soon"}
          onPress={() => isAvailable && addToCart(product, 1, user?.id)}
          variant={isAvailable ? "secondary" : "ghost"}
          disabled={!isAvailable}
        />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, padding: 12 },
  badge: {
    position: "absolute",
    left: 10,
    top: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  rating: { flexDirection: "row", alignItems: "center", gap: 3 },
  name: { fontSize: 20, lineHeight: 24 },
  description: { minHeight: 36 },
  priceRow: { flexDirection: "row", gap: 5, alignItems: "baseline" },
  tapeWrapper: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  tapeContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 40,
  },
  tape: {
    position: "absolute",
    width: "120%",
    height: 6,
    transform: [{ rotate: "-4deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  revealBadge: {
    backgroundColor: "#FDFCFB",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#EFEBE7",
  },
});
