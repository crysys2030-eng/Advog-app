import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { useUpcomingDeadlines, useCases } from "@/contexts/CaseContext";
import Colors from "@/constants/colors";
import { Calendar as CalendarIcon, CheckCircle2, Circle, ChevronLeft, ChevronRight, Trash2 } from "lucide-react-native";

export default function CalendarScreen() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { updateDeadline, deleteDeadline } = useCases();
  const allDeadlines = useUpcomingDeadlines(90);

  const monthDeadlines = allDeadlines.filter((d) => {
    const date = new Date(d.date);
    return (
      date.getMonth() === selectedMonth.getMonth() &&
      date.getFullYear() === selectedMonth.getFullYear()
    );
  });

  const getDeadlineTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      audiencia: "Audiência",
      recurso: "Recurso",
      manifestacao: "Manifestação",
      peticao: "Petição",
      outro: "Outro",
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      weekday: "long",
    });
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedMonth(newDate);
  };

  const toggleDeadlineComplete = (caseId: string, deadlineId: string, completed: boolean) => {
    updateDeadline(caseId, deadlineId, { completed: !completed });
  };

  const handleDeleteDeadline = (caseId: string, deadlineId: string, title: string) => {
    Alert.alert(
      "Eliminar Prazo",
      `Tem certeza que deseja eliminar o prazo "${title}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteDeadline(caseId, deadlineId),
        },
      ]
    );
  };

  const groupedDeadlines = monthDeadlines.reduce((acc, deadline) => {
    const date = new Date(deadline.date).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(deadline);
    return acc;
  }, {} as Record<string, typeof monthDeadlines>);

  const sortedDates = Object.keys(groupedDeadlines).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
            <ChevronLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.monthInfo}>
            <Text style={styles.monthText}>
              {selectedMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </Text>
            <Text style={styles.deadlineCount}>{monthDeadlines.length} prazos</Text>
          </View>
          <TouchableOpacity onPress={goToNextMonth} style={styles.monthButton}>
            <ChevronRight size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {monthDeadlines.length === 0 ? (
          <View style={styles.emptyState}>
            <CalendarIcon size={48} color={Colors.text.tertiary} />
            <Text style={styles.emptyText}>Nenhum prazo neste mês</Text>
          </View>
        ) : (
          <View style={styles.deadlinesList}>
            {sortedDates.map((dateStr) => {
              const date = new Date(dateStr);
              const deadlines = groupedDeadlines[dateStr];

              return (
                <View key={dateStr} style={styles.dateGroup}>
                  <View style={styles.dateHeader}>
                    <View style={styles.dateBadge}>
                      <Text style={styles.dateBadgeDay}>{date.getDate()}</Text>
                      <Text style={styles.dateBadgeMonth}>
                        {date.toLocaleDateString("pt-BR", { month: "short" })}
                      </Text>
                    </View>
                    <View style={styles.dateHeaderText}>
                      <Text style={styles.dateTitle}>{formatDate(dateStr)}</Text>
                      <Text style={styles.dateCount}>
                        {deadlines.length} prazo{deadlines.length !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.dateDeadlines}>
                    {deadlines.map((deadline) => (
                      <View key={deadline.id} style={styles.deadlineCardWrapper}>
                        <View style={styles.deadlineCard}>
                          <TouchableOpacity
                            style={styles.deadlineCheckbox}
                            onPress={() =>
                              toggleDeadlineComplete(deadline.caseId, deadline.id, deadline.completed)
                            }
                          >
                            {deadline.completed ? (
                              <CheckCircle2 size={24} color={Colors.success} />
                            ) : (
                              <Circle size={24} color={Colors.text.tertiary} />
                            )}
                          </TouchableOpacity>

                          <View style={styles.deadlineContent}>
                          <View style={styles.deadlineHeader}>
                            <Text
                              style={[
                                styles.deadlineTitle,
                                deadline.completed && styles.deadlineTitleCompleted,
                              ]}
                            >
                              {deadline.title}
                            </Text>
                            <View style={styles.deadlineTypeBadge}>
                              <Text style={styles.deadlineTypeText}>
                                {getDeadlineTypeLabel(deadline.type)}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.deadlineCase}>{deadline.caseName}</Text>
                          <Text style={styles.deadlineProcess}>{deadline.processNumber}</Text>

                            {deadline.notes && (
                              <Text style={styles.deadlineNotes}>{deadline.notes}</Text>
                            )}
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.deadlineDeleteButton}
                          onPress={() => handleDeleteDeadline(deadline.caseId, deadline.id, deadline.title)}
                          activeOpacity={0.7}
                        >
                          <Trash2 size={16} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}
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
    backgroundColor: Colors.background,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  monthInfo: {
    alignItems: "center",
  },
  monthText: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    textTransform: "capitalize",
  },
  deadlineCount: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.tertiary,
    marginTop: 16,
  },
  deadlinesList: {
    gap: 24,
  },
  dateGroup: {
    gap: 16,
  },
  dateHeader: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  dateBadge: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  dateBadgeDay: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text.inverse,
  },
  dateBadgeMonth: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text.inverse,
    textTransform: "uppercase",
    opacity: 0.9,
  },
  dateHeaderText: {
    flex: 1,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    textTransform: "capitalize",
  },
  dateCount: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  dateDeadlines: {
    gap: 12,
    paddingLeft: 80,
  },
  deadlineCard: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deadlineCheckbox: {
    paddingTop: 2,
  },
  deadlineContent: {
    flex: 1,
    gap: 6,
  },
  deadlineHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  deadlineTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  deadlineTitleCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  deadlineTypeBadge: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deadlineTypeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
    textTransform: "uppercase",
  },
  deadlineCase: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  deadlineProcess: {
    fontSize: 13,
    color: Colors.text.tertiary,
  },
  deadlineNotes: {
    fontSize: 14,
    color: Colors.text.primary,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  deadlineCardWrapper: {
    position: "relative",
  },
  deadlineDeleteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 10,
  },
});
