import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { AppButton, AppInput, AppText, Card, Screen } from "@/components/Themed";
import { RootStackParamList } from "@/navigation/types";
import { useUserStore } from "@/store/userStore";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const signIn = useUserStore((state) => state.signIn);
  const signUp = useUserStore((state) => state.signUp);
  const isLoading = useUserStore((state) => state.isLoading);
  const error = useUserStore((state) => state.error);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (mode: "signin" | "signup") => {
    if (mode === "signin") await signIn(email, password);
    else await signUp(email, password);
    navigation.goBack();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <AppText variant="eyebrow">Account</AppText>
          <AppText variant="heading">Login to Amritya</AppText>
          <AppText variant="small">Sync your cart, addresses, orders, and profile across devices.</AppText>
          <AppInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <AppInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
          {error && <AppText variant="small" style={{ color: "#B42318" }}>{error}</AppText>}
          <AppButton label="Sign in" onPress={() => submit("signin")} loading={isLoading} />
          <AppButton label="Create account" onPress={() => submit("signup")} variant="secondary" loading={isLoading} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18 },
  card: { gap: 14 },
});
