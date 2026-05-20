import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Check, Leaf, ShieldCheck, Star, Truck } from "lucide-react-native";
import {
  AppButton,
  AppInput,
  AppText,
  Card,
  Screen,
} from "@/components/Themed";
import { ProductImage } from "@/components/ProductImage";
import { QuantityStepper } from "@/components/QuantityStepper";
import { NUTRITION_FACTS } from "@/constants/brand";
import {
  getDiscountPercent,
  getDiscountedPrice,
  hasProductDiscount,
} from "@/lib/pricing";
import { RootStackParamList } from "@/navigation/types";
import { useCartStore } from "@/store/cartStore";
import { useProductStore } from "@/store/productStore";
import { useThemeStore } from "@/store/themeStore";
import { useUserStore } from "@/store/userStore";

type Props = NativeStackScreenProps<RootStackParamList, "ProductDetail">;

export function ProductDetailScreen({ navigation, route }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { productId } = route.params;
  const products = useProductStore((state) => state.products);
  const fetchProductById = useProductStore((state) => state.fetchProductById);
  const fetchReviews = useProductStore((state) => state.fetchReviews);
  const submitReview = useProductStore((state) => state.submitReview);
  const reviews = useProductStore(
    (state) => state.reviewsByProduct[productId] || [],
  );
  const addToCart = useCartStore((state) => state.addToCart);
  const user = useUserStore((state) => state.user);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [name, setName] = useState(user?.email?.split("@")[0] || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const product = products.find((item) => item.id === productId);
  const isAvailable = product?.available !== false;

  useEffect(() => {
    fetchProductById(productId);
    fetchReviews(productId);
  }, [fetchProductById, fetchReviews, productId]);

  const averageRating = useMemo(() => {
    const rated = reviews.filter((review) => typeof review.rating === "number");
    if (!rated.length) return product?.rating || 0;
    return (
      rated.reduce((sum, review) => sum + (review.rating || 0), 0) /
      rated.length
    );
  }, [product?.rating, reviews]);

  if (!product) {
    return (
      <Screen style={styles.center}>
        <AppText>Loading product...</AppText>
      </Screen>
    );
  }

  const price = getDiscountedPrice(product);
  const submit = async () => {
    if (!rating && !comment.trim()) {
      Alert.alert("Add a rating or comment");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitReview(
        product.id,
        user?.id || null,
        name || "Anonymous",
        rating,
        comment.trim() || null,
      );
      setRating(null);
      setComment("");
      Alert.alert("Thank you", "Your feedback has been submitted.");
    } catch (error) {
      Alert.alert(
        "Could not submit",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.header}>
          <AppText variant="eyebrow">{product.category}</AppText>
          <AppText variant="title">{product.name}</AppText>
          <View style={styles.ratingRow}>
            {[0, 1, 2, 3, 4].map((star) => (
              <Star
                key={star}
                size={16}
                color={colors.gold}
                fill={
                  star < Math.round(averageRating) ? colors.gold : "transparent"
                }
              />
            ))}
            <AppText variant="small">
              {averageRating.toFixed(1)} ·{" "}
              {Math.max(reviews.length, product.review_count || 0)} reviews
            </AppText>
          </View>
        </Card>

        <ProductImage product={product} size="large" />

        <Card style={styles.panel}>
          <View style={styles.priceRow}>
            {isAvailable ? (
              <>
                <AppText variant="price" style={{ color: colors.primary }}>₹{price.toFixed(2)}</AppText>
                {hasProductDiscount(product) && (
                  <AppText variant="small" style={{ color: colors.gold, fontWeight: "800" }}>
                    {getDiscountPercent(product)}% off
                  </AppText>
                )}
              </>
            ) : (
              <View style={styles.tapeWrapperLarge}>
                <AppText variant="price" style={{ color: colors.primary }}>
                  ₹
                </AppText>
                <View style={styles.tapeContainerLarge}>
                  <AppText variant="price" style={{ color: colors.primary, opacity: 0.15 }}>
                    {product.price.toFixed(2)}
                  </AppText>
                  <View style={[styles.tapeLarge, { backgroundColor: colors.gold }]} />
                </View>
              </View>
            )}
          </View>
          <AppText>{product.description}</AppText>
          <View style={styles.infoGrid}>
            <View style={[styles.info, { borderColor: colors.border }]}>
              <Leaf color={colors.primary} />
              <AppText variant="small">Origin</AppText>
              <AppText style={{ fontWeight: "800" }}>{product.origin}</AppText>
            </View>
            <View style={[styles.info, { borderColor: colors.border }]}>
              <ShieldCheck color={colors.primary} />
              <AppText variant="small">Weight</AppText>
              <AppText style={{ fontWeight: "800" }}>{product.weight}</AppText>
            </View>
          </View>
          <View style={styles.cartRow}>
            {isAvailable && (
              <QuantityStepper
                value={quantity}
                onChange={(next) => setQuantity(Math.max(1, next))}
              />
            )}
            <AppButton
              label={isAvailable ? "Add to cart" : "Available soon"}
              variant={isAvailable ? "primary" : "ghost"}
              disabled={!isAvailable}
              onPress={() => {
                addToCart(product, quantity, user?.id);
                Alert.alert("Added", `${product.name} is in your cart.`);
              }}
            />
          </View>
          {isAvailable && (
            <View style={[styles.shipping, { borderColor: colors.border }]}>
              <Truck size={18} color={colors.primary} />
              <AppText variant="small">
                Free shipping on orders over ₹500
              </AppText>
            </View>
          )}
        </Card>

        <Card style={styles.panel}>
          <AppText variant="eyebrow">Key benefits</AppText>
          {(product.benefits || []).map((benefit) => (
            <View key={benefit} style={styles.benefit}>
              <Check color={colors.primary} size={16} />
              <AppText>{benefit}</AppText>
            </View>
          ))}
        </Card>

        <Card style={styles.panel}>
          <AppText variant="eyebrow">Nutritional value</AppText>
          <View style={styles.nutritionGrid}>
            {NUTRITION_FACTS.map((fact) => (
              <View
                key={fact.label}
                style={[styles.nutrition, { borderColor: colors.border }]}
              >
                <AppText variant="small">{fact.label}</AppText>
                <AppText style={{ fontWeight: "800" }}>{fact.value}</AppText>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.panel}>
          <AppText variant="eyebrow">Share your feedback</AppText>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(rating === star ? null : star)}
              >
                <Star
                  size={28}
                  color={colors.gold}
                  fill={star <= (rating || 0) ? colors.gold : "transparent"}
                />
              </Pressable>
            ))}
          </View>
          <AppInput
            placeholder="Your name"
            value={name}
            onChangeText={setName}
          />
          <AppInput
            placeholder="Your review"
            multiline
            value={comment}
            onChangeText={setComment}
            style={{ minHeight: 90 }}
          />
          <AppButton
            label="Submit feedback"
            onPress={submit}
            loading={isSubmitting}
          />
        </Card>

        {reviews.length > 0 && (
          <Card style={styles.panel}>
            <AppText variant="heading">Customer reviews</AppText>
            {reviews.slice(0, 6).map((review) => (
              <View
                key={review.id}
                style={[styles.review, { borderColor: colors.border }]}
              >
                <AppText style={{ fontWeight: "800" }}>
                  {review.user_name || "Anonymous"}
                </AppText>
                {review.comment && (
                  <AppText variant="small">"{review.comment}"</AppText>
                )}
              </View>
            ))}
          </Card>
        )}

        <AppButton
          label="Go to cart"
          onPress={() => navigation.navigate("MainTabs")}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, gap: 18 },
  center: { alignItems: "center", justifyContent: "center" },
  header: { gap: 10 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  panel: { gap: 14 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 12 },
  tapeContainerLarge: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    minWidth: 100,
  },
  tapeLarge: {
    position: "absolute",
    width: "110%",
    height: 12,
    transform: [{ rotate: "-2deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  revealRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  revealBadge: {
    backgroundColor: "#FDFCFB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#EFEBE7",
  },
  infoGrid: { flexDirection: "row", gap: 10 },
  info: { flex: 1, borderWidth: 1, padding: 12, gap: 5 },
  cartRow: { gap: 10 },
  shipping: { borderWidth: 1, padding: 12, flexDirection: "row", gap: 8 },
  benefit: { flexDirection: "row", gap: 10, alignItems: "center" },
  nutritionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  nutrition: { width: "47%", borderWidth: 1, padding: 12 },
  review: { borderTopWidth: 1, paddingTop: 12, gap: 4 },
});
