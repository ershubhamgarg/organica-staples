import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppNavigator } from "@/navigation/AppNavigator";
import { useThemeStore } from "@/store/themeStore";
import { useUserStore } from "@/store/userStore";

export default function App() {
  const navigationTheme = useThemeStore((state) => state.navigationTheme);
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const fetchUser = useUserStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <AppNavigator />
    </NavigationContainer>
  );
}
