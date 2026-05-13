import { ScrollView, StyleSheet, View } from "react-native";
import { Trash2 } from "lucide-react-native";
import { AppButton, AppText, Card, Screen } from "@/components/Themed";
import { ProductImage } from "@/components/ProductImage";
import { QuantityStepper } from "@/components/QuantityStepper";
import { getCartTotals } from "@/lib/pricing";
import { RootStackParamList } from "@/navigation/types";
import { useCartStore } from "@/store/cartStore";
import { useThemeStore } from "@/store/themeStore";
import { useUserStore } from "@/store/userStore";

type Props = { navigation: { navigate: (screen: keyof RootStackParamList) => void } };

export function CartScreen({ navigation }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const user = useUserStore((state) => state.user);
  const totals = getCartTotals(items);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppText variant="heading">Your Cart</AppText>
          <AppText variant="small">{items.length} items</AppText>
        </View>

        {items.length === 0 ? (
          <Card style={styles.empty}>
            <AppText variant="heading">Your cart is empty</AppText>
            <AppText variant="small">Add organic staples to begin your order.</AppText>
          </Card>
        ) : (
          <>
            {items.map((item) => (
              <Card key={item.id} style={styles.item}>
                <ProductImage product={item} size="small" />
                <View style={styles.itemBody}>
                  <AppText style={{ fontWeight: "800" }}>{item.name}</AppText>
                  <AppText variant="small">{item.weight}</AppText>
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(quantity) => updateQuantity(item.id, quantity, user?.id)}
                  />
                </View>
                <View style={styles.itemRight}>
                  <Trash2 color={colors.danger} size={18} onPress={() => removeFromCart(item.id, user?.id)} />
                  <AppText style={{ fontWeight: "800" }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </AppText>
                </View>
              </Card>
            ))}

            <Card style={styles.summary}>
              <AppText variant="heading">Order Summary</AppText>
              <Row label="Subtotal" value={`₹${totals.subtotal.toFixed(2)}`} />
              <Row label="Discount" value={`-₹${totals.discount.toFixed(2)}`} />
              <Row label="Shipping" value={totals.shipping ? `₹${totals.shipping.toFixed(2)}` : "Free"} />
              <Row label="Total" value={`₹${totals.total.toFixed(2)}`} strong />
              <AppButton label="Checkout" onPress={() => navigation.navigate("Checkout")} />
            </Card>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <AppText variant={strong ? "body" : "small"} style={strong ? { fontWeight: "800" } : undefined}>
        {label}
      </AppText>
      <AppText variant={strong ? "body" : "small"} style={strong ? { fontWeight: "800" } : undefined}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, gap: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  empty: { alignItems: "center", gap: 8 },
  item: { flexDirection: "row", gap: 12 },
  itemBody: { flex: 1, gap: 8 },
  itemRight: { justifyContent: "space-between", alignItems: "flex-end" },
  summary: { gap: 12 },
  row: { flexDirection: "row", justifyContent: "space-between" },
});
