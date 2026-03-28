import { Link, Stack } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import Colors from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Página Não Encontrada" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Esta página não existe</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Voltar ao início</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600" as const,
  },
});
