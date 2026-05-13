import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { HeartPulse } from "lucide-react-native";
import { AppButton, AppInput, AppText, Card } from "@/components/Themed";
import { useThemeStore } from "@/store/themeStore";

type Profile = {
  age: string;
  height: string;
  weight: string;
  cholesterol: string;
  fastingSugar: string;
  hba1c: string;
};

const initialProfile: Profile = {
  age: "",
  height: "",
  weight: "",
  cholesterol: "",
  fastingSugar: "",
  hba1c: "",
};

function numberValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function HelpMeDecide() {
  const colors = useThemeStore((state) => state.colors);
  const [profile, setProfile] = useState(initialProfile);
  const [submitted, setSubmitted] = useState(false);

  const recommendations = useMemo(() => {
    const fastingSugar = numberValue(profile.fastingSugar);
    const hba1c = numberValue(profile.hba1c);
    const cholesterol = numberValue(profile.cholesterol);
    const heightM = numberValue(profile.height) / 100;
    const bmi = heightM ? numberValue(profile.weight) / (heightM * heightM) : 0;

    const results = [];
    if (fastingSugar >= 100 || hba1c >= 5.7) {
      results.push({
        title: "Sugar-conscious staple",
        product: "Diacare Aata",
        body: "A steadier flour choice for everyday rotis when sugar markers need attention.",
      });
    }
    if (cholesterol >= 200) {
      results.push({
        title: "Heart-smart swap",
        product: "Extra Virgin Olive Oil",
        body: "Use less refined oil and bring olive oil into dressings and low-to-medium heat cooking.",
      });
    }
    if (bmi >= 25) {
      results.push({
        title: "Lighter pantry rhythm",
        product: "High-fibre flours and pulses",
        body: "Fibre-forward staples can make meals more satisfying and balanced.",
      });
    }
    return results.length
      ? results
      : [
          {
            title: "Everyday energy",
            product: "Organic Millets and Whole Grains",
            body: "A wholesome rotation for steady, satisfying meals.",
          },
        ];
  }, [profile]);

  return (
    <Card style={styles.wrap}>
      <View style={styles.header}>
        <HeartPulse size={22} color={colors.primary} />
        <AppText variant="eyebrow">Help me decide</AppText>
      </View>
      <AppText variant="heading">Personal pantry guide</AppText>
      <AppText variant="small">
        Optional wellness markers create product suggestions. This is a shopping guide, not medical advice.
      </AppText>
      <View style={styles.grid}>
        {(["age", "height", "weight", "cholesterol", "fastingSugar", "hba1c"] as const).map((key) => (
          <AppInput
            key={key}
            keyboardType="numeric"
            value={profile[key]}
            placeholder={
              key === "fastingSugar"
                ? "Fasting sugar"
                : key === "hba1c"
                  ? "HbA1c"
                  : key[0].toUpperCase() + key.slice(1)
            }
            onChangeText={(value) => setProfile((current) => ({ ...current, [key]: value }))}
            style={styles.input}
          />
        ))}
      </View>
      <AppButton label="Reveal suggestions" onPress={() => setSubmitted(true)} />
      {submitted && (
        <View style={styles.results}>
          {recommendations.map((item) => (
            <View key={item.title} style={[styles.result, { borderColor: colors.border }]}>
              <AppText variant="eyebrow">{item.title}</AppText>
              <AppText variant="body" style={{ fontWeight: "800" }}>
                {item.product}
              </AppText>
              <AppText variant="small">{item.body}</AppText>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  input: { flexBasis: "48%", flexGrow: 1 },
  results: { gap: 10 },
  result: { borderWidth: 1, padding: 12, gap: 4 },
});
