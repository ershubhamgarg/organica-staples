import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, View } from "react-native";
import { AppText, Card, Screen } from "@/components/Themed";
import { RootStackParamList } from "@/navigation/types";
import { useAddressStore } from "@/store/addressStore";
import { useOrderStore } from "@/store/orderStore";
import { useUserStore } from "@/store/userStore";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export function ProfileScreen({ navigation }: Props) {
  const user = useUserStore((state) => state.user);
  const orders = useOrderStore((state) => state.orders);
  const addresses = useAddressStore((state) => state.addresses);

  if (!user) {
    navigation.replace("Login");
    return null;
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <AppText variant="eyebrow">Profile</AppText>
          <AppText variant="heading">{user.email}</AppText>
        </Card>

        <Card style={styles.card}>
          <AppText variant="heading">Orders</AppText>
          {orders.length === 0 ? (
            <AppText variant="small">No orders yet.</AppText>
          ) : (
            orders.map((order) => (
              <View key={order.id} style={styles.row}>
                <AppText style={{ fontWeight: "800" }}>#{order.id.slice(0, 8).toUpperCase()}</AppText>
                <AppText variant="small">₹{order.total_amount.toFixed(2)} · {order.status}</AppText>
              </View>
            ))
          )}
        </Card>

        <Card style={styles.card}>
          <AppText variant="heading">Addresses</AppText>
          {addresses.length === 0 ? (
            <AppText variant="small">Saved addresses will appear here.</AppText>
          ) : (
            addresses.map((address) => (
              <View key={address.id} style={styles.row}>
                <AppText style={{ fontWeight: "800" }}>{address.name}</AppText>
                <AppText variant="small">{address.address}, {address.city}</AppText>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, gap: 16 },
  card: { gap: 12 },
  row: { gap: 4, paddingVertical: 8 },
});
