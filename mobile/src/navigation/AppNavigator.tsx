import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home, ShoppingBag, User } from "lucide-react-native";
import { HomeScreen } from "@/screens/HomeScreen";
import { CartScreen } from "@/screens/CartScreen";
import { CheckoutScreen } from "@/screens/CheckoutScreen";
import { LoginScreen } from "@/screens/LoginScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { ProductDetailScreen } from "@/screens/ProductDetailScreen";
import { OurStoryScreen } from "@/screens/OurStoryScreen";
import { AccountScreen } from "@/screens/AccountScreen";
import { useCartStore } from "@/store/cartStore";
import { useThemeStore } from "@/store/themeStore";
import { RootStackParamList, TabParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  const colors = useThemeStore((state) => state.colors);
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color }) => <Home color={color} size={20} /> }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarBadge: totalItems || undefined,
          tabBarIcon: ({ color }) => <ShoppingBag color={color} size={20} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ tabBarIcon: ({ color }) => <User color={color} size={20} /> }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const colors = useThemeStore((state) => state.colors);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "Product" }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="OurStory" component={OurStoryScreen} options={{ title: "Our Story" }} />
    </Stack.Navigator>
  );
}
