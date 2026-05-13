import { useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ArrowRight, Moon, Sun } from "lucide-react-native";
import { BRAND } from "@/constants/brand";
import { HelpMeDecide } from "@/components/HelpMeDecide";
import { ProductCard } from "@/components/ProductCard";
import { AppButton, AppInput, AppText, Card, Screen } from "@/components/Themed";
import { RootStackParamList } from "@/navigation/types";
import { useProductStore } from "@/store/productStore";
import { useThemeStore } from "@/store/themeStore";

type Props = { navigation: { navigate: (screen: keyof RootStackParamList, params?: object) => void } };

export function HomeScreen({ navigation }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const products = useProductStore((state) => state.products);
  const isLoading = useProductStore((state) => state.isLoading);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"default" | "price-asc" | "price-desc">("default");
  const [contact, setContact] = useState({ name: "", email: "", subject: "", message: "" });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );

  const visibleProducts = useMemo(() => {
    const next = category === "All" ? [...products] : products.filter((product) => product.category === category);
    if (sort === "price-asc") next.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") next.sort((a, b) => b.price - a.price);
    return next;
  }, [category, products, sort]);

  const sendWhatsapp = () => {
    const message = encodeURIComponent(
      `[Amritya Organics]\nName: ${contact.name}\nEmail: ${contact.email}\nSubject: ${contact.subject}\nMessage: ${contact.message}`,
    );
    Linking.openURL(`https://wa.me/${BRAND.whatsappPhone}?text=${message}`);
  };

  return (
    <Screen>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchProducts} />}
        contentContainerStyle={styles.content}
      >
        <ImageBackground source={{ uri: BRAND.heroImage }} style={styles.hero} imageStyle={styles.heroImage}>
          <View style={styles.heroOverlay} />
          <View style={styles.heroTop}>
            <AppText variant="eyebrow" style={{ color: "#F8F5F0" }}>Est. 2026</AppText>
            <Pressable onPress={toggleTheme} style={styles.themeButton}>
              {colorScheme === "dark" ? <Sun color="#F8F5F0" /> : <Moon color="#F8F5F0" />}
            </Pressable>
          </View>
          <View style={styles.heroCopy}>
            <AppText variant="title" style={{ color: "#fff" }}>
              Pure by nature. Essential by choice.
            </AppText>
            <AppText variant="body" style={{ color: "#F8F5F0" }}>
              Premium organic staples for a quieter kind of everyday luxury.
            </AppText>
            <AppButton label="Shop collection" onPress={() => undefined} />
          </View>
        </ImageBackground>

        <View style={styles.sectionHeader}>
          <View>
            <AppText variant="eyebrow">Curated pantry</AppText>
            <AppText variant="heading">Our Essentials</AppText>
          </View>
          <Pressable onPress={() => setSort(sort === "price-asc" ? "price-desc" : "price-asc")}>
            <AppText variant="small">{sort === "price-desc" ? "High to low" : "Low to high"}</AppText>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {categories.map((item) => (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[
                styles.chip,
                { borderColor: colors.border, backgroundColor: item === category ? colors.primary : colors.surface },
              ]}
            >
              <AppText variant="small" style={{ color: item === category ? "#fff" : colors.text, fontWeight: "800" }}>
                {item}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.productGrid}>
          {visibleProducts.map((product) => (
            <View key={product.id} style={styles.productCell}>
              <ProductCard
                product={product}
                onPress={() => navigation.navigate("ProductDetail", { productId: product.id })}
              />
            </View>
          ))}
        </View>

        <HelpMeDecide />

        <Card style={styles.promise}>
          <AppText variant="eyebrow">Our promise</AppText>
          <AppText variant="heading">Staples chosen with restraint, care, and provenance.</AppText>
          {["Fairly priced", "100% organic", "Ethically sourced"].map((item) => (
            <View key={item} style={[styles.promiseRow, { borderColor: colors.border }]}>
              <ArrowRight color={colors.gold} size={18} />
              <AppText>{item}</AppText>
            </View>
          ))}
        </Card>

        <Card style={styles.contact}>
          <AppText variant="eyebrow">Concierge support</AppText>
          <AppText variant="heading">Get in touch</AppText>
          <AppInput placeholder="Full name" value={contact.name} onChangeText={(name) => setContact({ ...contact, name })} />
          <AppInput placeholder="Email" value={contact.email} onChangeText={(email) => setContact({ ...contact, email })} />
          <AppInput placeholder="Subject" value={contact.subject} onChangeText={(subject) => setContact({ ...contact, subject })} />
          <AppInput
            placeholder="Message"
            multiline
            value={contact.message}
            onChangeText={(message) => setContact({ ...contact, message })}
            style={{ minHeight: 96, textAlignVertical: "top" }}
          />
          <AppButton label="Send message" onPress={sendWhatsapp} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28, gap: 22 },
  hero: { minHeight: 520, padding: 22, justifyContent: "space-between" },
  heroImage: { opacity: 0.88 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(20,22,17,0.58)" },
  heroTop: { flexDirection: "row", justifyContent: "space-between", marginTop: 36 },
  heroCopy: { gap: 16 },
  themeButton: { padding: 8 },
  sectionHeader: { paddingHorizontal: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  chips: { paddingHorizontal: 18, gap: 10 },
  chip: { borderWidth: 1, paddingVertical: 9, paddingHorizontal: 14 },
  productGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 10, gap: 12 },
  productCell: { width: "48%", flexGrow: 1 },
  promise: { marginHorizontal: 18, gap: 14 },
  promiseRow: { borderTopWidth: 1, paddingTop: 12, flexDirection: "row", gap: 10, alignItems: "center" },
  contact: { marginHorizontal: 18, gap: 12 },
});
