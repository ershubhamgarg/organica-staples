import { ScrollView, StyleSheet } from "react-native";
import { AppButton, AppText, Card, Screen } from "@/components/Themed";
import { RootStackParamList } from "@/navigation/types";
import { useThemeStore } from "@/store/themeStore";
import { useUserStore } from "@/store/userStore";

type Props = { navigation: { navigate: (screen: keyof RootStackParamList) => void } };

export function AccountScreen({ navigation }: Props) {
  const user = useUserStore((state) => state.user);
  const signOut = useUserStore((state) => state.signOut);
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <AppText variant="eyebrow">Account</AppText>
          <AppText variant="heading">{user ? "Welcome back" : "Good food begins here"}</AppText>
          <AppText variant="small">{user?.email || "Sign in to sync cart, addresses, and orders."}</AppText>
          {user ? (
            <>
              <AppButton label="View profile" onPress={() => navigation.navigate("Profile")} />
              <AppButton label="Sign out" onPress={signOut} variant="secondary" />
            </>
          ) : (
            <AppButton label="Login or signup" onPress={() => navigation.navigate("Login")} />
          )}
          <AppButton label={`Switch to ${colorScheme === "dark" ? "light" : "dark"} theme`} onPress={toggleTheme} variant="ghost" />
          <AppButton label="Our story" onPress={() => navigation.navigate("OurStory")} variant="secondary" />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18 },
  card: { gap: 14 },
});
