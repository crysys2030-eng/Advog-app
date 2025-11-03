import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useRef } from "react";
import Colors from "@/constants/colors";
import { Sparkles, Info } from "lucide-react-native";
import { useCases } from "@/contexts/CaseContext";
import { useClients } from "@/contexts/ClientContext";
import { useDocuments } from "@/contexts/DocumentContext";

type StatItem = {
  label: string;
  value: string | number;
  color: string;
};

export default function AssistantScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const { cases } = useCases();
  const { clients } = useClients();
  const { documents } = useDocuments();

  const stats: StatItem[] = [
    { label: "Processos Ativos", value: cases.filter(c => c.status === "active").length, color: Colors.primary },
    { label: "Processos Urgentes", value: cases.filter(c => c.status === "urgent").length, color: Colors.error },
    { label: "Total de Clientes", value: clients.length, color: Colors.success },
    { label: "Documentos", value: documents.length, color: Colors.info },
  ];

  const upcomingDeadlines = cases
    .flatMap(c => (c.deadlines || []).map(d => ({ ...d, caseTitle: c.title, caseId: c.id })))
    .filter(d => !d.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Sparkles size={24} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.headerTitle}>Assistente Jurídico</Text>
          <Text style={styles.headerSubtitle}>Seu assistente com IA para processos administrativos</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximos Prazos</Text>
          {upcomingDeadlines.length === 0 ? (
            <View style={styles.emptyCard}>
              <Info size={24} color={Colors.text.tertiary} />
              <Text style={styles.emptyText}>Nenhum prazo pendente</Text>
            </View>
          ) : (
            upcomingDeadlines.map((deadline, index) => (
              <View key={index} style={styles.deadlineCard}>
                <View style={styles.deadlineHeader}>
                  <Text style={styles.deadlineTitle}>{deadline.title}</Text>
                  <Text style={styles.deadlineType}>{deadline.type}</Text>
                </View>
                <Text style={styles.deadlineCase}>{deadline.caseTitle}</Text>
                <Text style={styles.deadlineDate}>
                  {new Date(deadline.date).toLocaleDateString('pt-PT', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo de Atividades</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Processos Pendentes</Text>
              <Text style={styles.summaryValue}>{cases.filter(c => c.status === "pending").length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Processos Concluídos</Text>
              <Text style={styles.summaryValue}>{cases.filter(c => c.status === "completed").length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total de Processos</Text>
              <Text style={styles.summaryValue}>{cases.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Info size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Dashboard de visão geral do escritório. Acompanhe processos, prazos e atividades em tempo real.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 20,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  deadlineCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  deadlineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  deadlineTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    flex: 1,
  },
  deadlineType: {
    fontSize: 12,
    color: Colors.text.inverse,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    textTransform: "capitalize",
  },
  deadlineCase: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  deadlineDate: {
    fontSize: 13,
    color: Colors.text.tertiary,
  },
  summaryCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});
