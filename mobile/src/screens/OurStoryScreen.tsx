import { ScrollView, StyleSheet } from "react-native";
import { AppText, Card, Screen } from "@/components/Themed";

export function OurStoryScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <AppText variant="eyebrow">Our story</AppText>
          <AppText variant="title">From the soil to a more mindful pantry.</AppText>
          <AppText>
            Amritya Organics curates premium organic staples with a focus on integrity,
            provenance, and everyday nourishment. The grains, oils, and pantry essentials
            are selected for homes that care about what goes into daily meals.
          </AppText>
        </Card>
        <Card style={styles.card}>
          <AppText variant="heading">Direct from the soil</AppText>
          <AppText>
            We value direct relationships, responsible sourcing, and fair pricing so
            organic food feels considered without becoming inaccessible.
          </AppText>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, gap: 16 },
  card: { gap: 14 },
});
