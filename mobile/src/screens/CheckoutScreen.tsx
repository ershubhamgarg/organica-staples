import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppButton, AppInput, AppText, Card, Screen } from "@/components/Themed";
import { PAYMENT_METHODS } from "@/constants/brand";
import { getCartTotals } from "@/lib/pricing";
import { RootStackParamList } from "@/navigation/types";
import { verifyVpa } from "@/services/upi";
import { useAddressStore } from "@/store/addressStore";
import { useCartStore } from "@/store/cartStore";
import { useOrderStore } from "@/store/orderStore";
import { useThemeStore } from "@/store/themeStore";
import { useUserStore } from "@/store/userStore";
import { Address } from "@/types/domain";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

const emptyAddress = {
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
};

export function CheckoutScreen({ navigation }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const user = useUserStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const addresses = useAddressStore((state) => state.addresses);
  const addAddress = useAddressStore((state) => state.addAddress);
  const placeOrder = useOrderStore((state) => state.placeOrder);
  const isPlacingOrder = useOrderStore((state) => state.isLoading);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(addresses[0]?.id || null);
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [payment, setPayment] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const totals = getCartTotals(items);

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) || null,
    [addresses, selectedAddressId],
  );

  const ensureUser = () => {
    if (!user) {
      navigation.navigate("Login");
      return false;
    }
    return true;
  };

  const saveAddress = async () => {
    if (!ensureUser()) return;
    if (!newAddress.name || !newAddress.phone || !newAddress.address) {
      Alert.alert("Address missing", "Please add name, phone, and address.");
      return;
    }
    const address = await addAddress(user!.id, newAddress);
    setSelectedAddressId(address.id);
    setNewAddress(emptyAddress);
  };

  const verify = async () => {
    const result = await verifyVpa(upiId);
    if (result.success) setVerifiedName(result.name || null);
    else Alert.alert("UPI verification failed", result.error);
  };

  const submitOrder = async () => {
    if (!ensureUser()) return;
    const address = selectedAddress;
    if (!address) {
      Alert.alert("Select an address", "Please add or select a delivery address.");
      return;
    }
    if (payment === "upi" && !verifiedName) {
      Alert.alert("Verify UPI", "Please verify your UPI ID first.");
      return;
    }
    const order = await placeOrder(user!.id, items, address as Address, payment, totals.total);
    clearCart(user!.id);
    Alert.alert("Order placed", `Order #${order.id.slice(0, 8).toUpperCase()} placed successfully.`, [
      { text: "OK", onPress: () => navigation.navigate("Profile") },
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="heading">Checkout</AppText>
        <Card style={styles.section}>
          <AppText variant="eyebrow">Delivery address</AppText>
          {addresses.map((address) => (
            <Pressable
              key={address.id}
              onPress={() => setSelectedAddressId(address.id)}
              style={[styles.option, { borderColor: selectedAddressId === address.id ? colors.primary : colors.border }]}
            >
              <AppText style={{ fontWeight: "800" }}>{address.name} · {address.phone}</AppText>
              <AppText variant="small">{address.address}, {address.city}, {address.state} {address.zipCode}</AppText>
            </Pressable>
          ))}
          {Object.keys(emptyAddress).map((key) => (
            <AppInput
              key={key}
              placeholder={key}
              value={newAddress[key as keyof typeof emptyAddress]}
              onChangeText={(value) => setNewAddress((current) => ({ ...current, [key]: value }))}
            />
          ))}
          <AppButton label="Save address" onPress={saveAddress} variant="secondary" />
        </Card>

        <Card style={styles.section}>
          <AppText variant="eyebrow">Payment</AppText>
          {PAYMENT_METHODS.map((method) => (
            <Pressable
              key={method.id}
              onPress={() => setPayment(method.id)}
              style={[styles.option, { borderColor: payment === method.id ? colors.primary : colors.border }]}
            >
              <AppText style={{ fontWeight: "800" }}>{method.label}</AppText>
            </Pressable>
          ))}
          {payment === "upi" && (
            <>
              <AppInput placeholder="name@upi" value={upiId} onChangeText={setUpiId} autoCapitalize="none" />
              <AppButton label={verifiedName ? `Verified: ${verifiedName}` : "Verify UPI"} onPress={verify} variant="secondary" />
            </>
          )}
        </Card>

        <Card style={styles.section}>
          <AppText variant="heading">₹{totals.total.toFixed(2)}</AppText>
          <AppText variant="small">Subtotal ₹{totals.subtotal.toFixed(2)} · Shipping {totals.shipping ? `₹${totals.shipping}` : "Free"}</AppText>
          <AppButton label="Place order" onPress={submitOrder} loading={isPlacingOrder} disabled={!items.length} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, gap: 16 },
  section: { gap: 12 },
  option: { borderWidth: 1, padding: 12, gap: 4 },
});
