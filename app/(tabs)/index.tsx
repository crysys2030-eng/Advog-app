import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useCases, useUpcomingDeadlines } from "@/contexts/CaseContext";
import Colors from "@/constants/colors";
import { Briefcase, Clock, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react-native";
import { Link } from "expo-router";

export default function DashboardScreen() {
  const { stats, cases } = useCases();
  const upcomingDeadlines = useUpcomingDeadlines(7);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoje";
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Amanhã";
    }
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Visão geral dos seus processos</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: Colors.primaryLight }]}>
          <Briefcase size={24} color={Colors.text.inverse} />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total de Casos</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: Colors.status.active }]}>
          <TrendingUp size={24} color={Colors.text.inverse} />
          <Text style={styles.statNumber}>{stats.active}</Text>
          <Text style={styles.statLabel}>Ativos</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: Colors.status.urgent }]}>
          <AlertTriangle size={24} color={Colors.text.inverse} />
          <Text style={styles.statNumber}>{stats.urgent}</Text>
          <Text style={styles.statLabel}>Urgentes</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: Colors.status.pending }]}>
          <Clock size={24} color={Colors.text.inverse} />
          <Text style={styles.statNumber}>{stats.upcomingDeadlines}</Text>
          <Text style={styles.statLabel}>Prazos (7 dias)</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos Prazos</Text>
          <Link href="/(tabs)/calendar" asChild>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {upcomingDeadlines.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle2 size={48} color={Colors.text.tertiary} />
            <Text style={styles.emptyText}>Nenhum prazo próximo</Text>
          </View>
        ) : (
          <View style={styles.deadlinesList}>
            {upcomingDeadlines.slice(0, 5).map((deadline) => (
              <View key={deadline.id} style={styles.deadlineCard}>
                <View style={styles.deadlineDate}>
                  <Text style={styles.deadlineDateText}>{formatDate(deadline.date)}</Text>
                </View>
                <View style={styles.deadlineContent}>
                  <Text style={styles.deadlineTitle}>{deadline.title}</Text>
                  <Text style={styles.deadlineCase} numberOfLines={1}>
                    {deadline.caseName}
                  </Text>
                  <Text style={styles.deadlineProcess}>{deadline.processNumber}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Casos Recentes</Text>
          <Link href="/(tabs)/cases" asChild>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.casesList}>
          {cases.slice(0, 3).map((caseItem) => (
            <TouchableOpacity key={caseItem.id} style={styles.caseCard}>

                <View style={styles.caseHeader}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: Colors.status[caseItem.status] },
                    ]}
                  />
                  <Text style={styles.caseTitle} numberOfLines={1}>
                    {caseItem.title}
                  </Text>
                </View>
                <Text style={styles.caseClient}>{caseItem.client}</Text>
                <Text style={styles.caseProcess}>{caseItem.processNumber}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    padding: 20,
    borderRadius: 16,
    gap: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.text.inverse,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text.inverse,
    opacity: 0.9,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: Colors.background,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.tertiary,
    marginTop: 12,
  },
  deadlinesList: {
    gap: 12,
  },
  deadlineCard: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  deadlineDate: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  deadlineDateText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    textAlign: "center",
  },
  deadlineContent: {
    flex: 1,
    gap: 4,
  },
  deadlineTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  deadlineCase: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  deadlineProcess: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  casesList: {
    gap: 12,
  },
  caseCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  caseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  caseTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  caseClient: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  caseProcess: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
});
