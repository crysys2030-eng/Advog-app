import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useUpcomingDeadlines, useCases } from "@/contexts/CaseContext";
import { useEvents } from "@/contexts/EventContext";
import Colors from "@/constants/colors";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Plus,
  Clock,
  MapPin,
  Users,
  FileText,
} from "lucide-react-native";
import { EventType } from "@/types/event";

type TabType = "eventos" | "prazos";

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<TabType>("eventos");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { updateDeadline, deleteDeadline } = useCases();
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const allDeadlines = useUpcomingDeadlines(90);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    type: "compromisso" as EventType,
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    location: "",
    participants: "",
    notes: "",
    reminder: true,
  });

  const resetForm = () => {
    setNewEvent({
      title: "",
      description: "",
      type: "compromisso",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
      location: "",
      participants: "",
      notes: "",
      reminder: true,
    });
  };

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) {
      Alert.alert("Erro", "O título é obrigatório");
      return;
    }

    const participantsList = newEvent.participants
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    addEvent({
      title: newEvent.title,
      description: newEvent.description || undefined,
      type: newEvent.type,
      date: new Date(newEvent.date + "T00:00:00").toISOString(),
      startTime: newEvent.startTime,
      endTime: newEvent.endTime || undefined,
      location: newEvent.location || undefined,
      participants: participantsList.length > 0 ? participantsList : undefined,
      notes: newEvent.notes || undefined,
      reminder: newEvent.reminder,
      completed: false,
    });

    resetForm();
    setShowAddModal(false);
    Alert.alert("Sucesso", "Evento adicionado com sucesso!");
  };

  const monthDeadlines = allDeadlines.filter((d) => {
    const date = new Date(d.date);
    return (
      date.getMonth() === selectedMonth.getMonth() &&
      date.getFullYear() === selectedMonth.getFullYear()
    );
  });

  const monthEvents = events.filter((e) => {
    const date = new Date(e.date);
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

  const getEventTypeLabel = (type: EventType) => {
    const labels: Record<EventType, string> = {
      reuniao: "Reunião",
      audiencia: "Audiência",
      compromisso: "Compromisso",
      consulta: "Consulta",
      outro: "Outro",
    };
    return labels[type];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT", {
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

  const toggleEventComplete = (eventId: string, completed: boolean) => {
    updateEvent(eventId, { completed: !completed });
  };

  const handleDeleteDeadline = (caseId: string, deadlineId: string, title: string) => {
    Alert.alert(
      "Eliminar Prazo",
      `Tem certeza que deseja eliminar o prazo "${title}"?`,
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

  const handleDeleteEvent = (eventId: string, title: string) => {
    Alert.alert(
      "Eliminar Evento",
      `Tem certeza que deseja eliminar o evento "${title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteEvent(eventId),
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

  const groupedEvents = monthEvents.reduce((acc, event) => {
    const date = new Date(event.date).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, typeof monthEvents>);

  const sortedDeadlineDates = Object.keys(groupedDeadlines).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const sortedEventDates = Object.keys(groupedEvents).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "eventos" && styles.tabActive]}
            onPress={() => setSelectedTab("eventos")}
          >
            <Text style={[styles.tabText, selectedTab === "eventos" && styles.tabTextActive]}>
              Eventos ({monthEvents.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "prazos" && styles.tabActive]}
            onPress={() => setSelectedTab("prazos")}
          >
            <Text style={[styles.tabText, selectedTab === "prazos" && styles.tabTextActive]}>
              Prazos ({monthDeadlines.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
            <ChevronLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.monthInfo}>
            <Text style={styles.monthText}>
              {selectedMonth.toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
            </Text>
          </View>
          <TouchableOpacity onPress={goToNextMonth} style={styles.monthButton}>
            <ChevronRight size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {selectedTab === "eventos" && (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Plus size={20} color={Colors.text.inverse} />
            <Text style={styles.addButtonText}>Adicionar Evento</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {selectedTab === "eventos" ? (
          monthEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <CalendarIcon size={48} color={Colors.text.tertiary} />
              <Text style={styles.emptyText}>Nenhum evento neste mês</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.emptyButtonText}>Adicionar Primeiro Evento</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.itemsList}>
              {sortedEventDates.map((dateStr) => {
                const date = new Date(dateStr);
                const eventsForDate = groupedEvents[dateStr];

                return (
                  <View key={dateStr} style={styles.dateGroup}>
                    <View style={styles.dateHeader}>
                      <View style={styles.dateBadge}>
                        <Text style={styles.dateBadgeDay}>{date.getDate()}</Text>
                        <Text style={styles.dateBadgeMonth}>
                          {date.toLocaleDateString("pt-PT", { month: "short" })}
                        </Text>
                      </View>
                      <View style={styles.dateHeaderText}>
                        <Text style={styles.dateTitle}>{formatDate(dateStr)}</Text>
                        <Text style={styles.dateCount}>
                          {eventsForDate.length} evento{eventsForDate.length !== 1 ? "s" : ""}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.dateItems}>
                      {eventsForDate.map((event) => (
                        <View key={event.id} style={styles.cardWrapper}>
                          <View style={styles.eventCard}>
                            <TouchableOpacity
                              style={styles.checkbox}
                              onPress={() => toggleEventComplete(event.id, event.completed)}
                            >
                              {event.completed ? (
                                <CheckCircle2 size={24} color={Colors.success} />
                              ) : (
                                <Circle size={24} color={Colors.text.tertiary} />
                              )}
                            </TouchableOpacity>

                            <View style={styles.cardContent}>
                              <View style={styles.cardHeader}>
                                <Text
                                  style={[
                                    styles.cardTitle,
                                    event.completed && styles.cardTitleCompleted,
                                  ]}
                                >
                                  {event.title}
                                </Text>
                                <View style={styles.typeBadge}>
                                  <Text style={styles.typeText}>
                                    {getEventTypeLabel(event.type)}
                                  </Text>
                                </View>
                              </View>

                              {event.description && (
                                <Text style={styles.description}>{event.description}</Text>
                              )}

                              <View style={styles.eventDetails}>
                                <View style={styles.detailRow}>
                                  <Clock size={14} color={Colors.text.secondary} />
                                  <Text style={styles.detailText}>
                                    {event.startTime}
                                    {event.endTime && ` - ${event.endTime}`}
                                  </Text>
                                </View>

                                {event.location && (
                                  <View style={styles.detailRow}>
                                    <MapPin size={14} color={Colors.text.secondary} />
                                    <Text style={styles.detailText}>{event.location}</Text>
                                  </View>
                                )}

                                {event.participants && event.participants.length > 0 && (
                                  <View style={styles.detailRow}>
                                    <Users size={14} color={Colors.text.secondary} />
                                    <Text style={styles.detailText}>
                                      {event.participants.join(", ")}
                                    </Text>
                                  </View>
                                )}

                                {event.notes && (
                                  <View style={styles.detailRow}>
                                    <FileText size={14} color={Colors.text.secondary} />
                                    <Text style={styles.detailText}>{event.notes}</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteEvent(event.id, event.title)}
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
          )
        ) : monthDeadlines.length === 0 ? (
          <View style={styles.emptyState}>
            <CalendarIcon size={48} color={Colors.text.tertiary} />
            <Text style={styles.emptyText}>Nenhum prazo neste mês</Text>
          </View>
        ) : (
          <View style={styles.itemsList}>
            {sortedDeadlineDates.map((dateStr) => {
              const date = new Date(dateStr);
              const deadlines = groupedDeadlines[dateStr];

              return (
                <View key={dateStr} style={styles.dateGroup}>
                  <View style={styles.dateHeader}>
                    <View style={styles.dateBadge}>
                      <Text style={styles.dateBadgeDay}>{date.getDate()}</Text>
                      <Text style={styles.dateBadgeMonth}>
                        {date.toLocaleDateString("pt-PT", { month: "short" })}
                      </Text>
                    </View>
                    <View style={styles.dateHeaderText}>
                      <Text style={styles.dateTitle}>{formatDate(dateStr)}</Text>
                      <Text style={styles.dateCount}>
                        {deadlines.length} prazo{deadlines.length !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.dateItems}>
                    {deadlines.map((deadline) => (
                      <View key={deadline.id} style={styles.cardWrapper}>
                        <View style={styles.deadlineCard}>
                          <TouchableOpacity
                            style={styles.checkbox}
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

                          <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                              <Text
                                style={[
                                  styles.cardTitle,
                                  deadline.completed && styles.cardTitleCompleted,
                                ]}
                              >
                                {deadline.title}
                              </Text>
                              <View style={styles.typeBadge}>
                                <Text style={styles.typeText}>
                                  {getDeadlineTypeLabel(deadline.type)}
                                </Text>
                              </View>
                            </View>

                            <Text style={styles.caseInfo}>{deadline.caseName}</Text>
                            <Text style={styles.processInfo}>{deadline.processNumber}</Text>

                            {deadline.notes && (
                              <Text style={styles.notes}>{deadline.notes}</Text>
                            )}
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() =>
                            handleDeleteDeadline(deadline.caseId, deadline.id, deadline.title)
                          }
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

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          resetForm();
          setShowAddModal(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                resetForm();
                setShowAddModal(false);
              }}
            >
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Novo Evento</Text>
            <TouchableOpacity onPress={handleAddEvent}>
              <Text style={styles.modalSave}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={styles.input}
                value={newEvent.title}
                onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
                placeholder="Ex: Reunião com cliente"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tipo</Text>
              <View style={styles.typeSelector}>
                {(["reuniao", "audiencia", "compromisso", "consulta", "outro"] as EventType[]).map(
                  (type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        newEvent.type === type && styles.typeOptionActive,
                      ]}
                      onPress={() => setNewEvent({ ...newEvent, type })}
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          newEvent.type === type && styles.typeOptionTextActive,
                        ]}
                      >
                        {getEventTypeLabel(type)}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newEvent.description}
                onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
                placeholder="Detalhes do evento"
                placeholderTextColor={Colors.text.tertiary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Data *</Text>
              <TextInput
                style={styles.input}
                value={newEvent.date}
                onChangeText={(text) => setNewEvent({ ...newEvent, date: text })}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>Início *</Text>
                <TextInput
                  style={styles.input}
                  value={newEvent.startTime}
                  onChangeText={(text) => setNewEvent({ ...newEvent, startTime: text })}
                  placeholder="HH:MM"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>

              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>Fim</Text>
                <TextInput
                  style={styles.input}
                  value={newEvent.endTime}
                  onChangeText={(text) => setNewEvent({ ...newEvent, endTime: text })}
                  placeholder="HH:MM"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Local</Text>
              <TextInput
                style={styles.input}
                value={newEvent.location}
                onChangeText={(text) => setNewEvent({ ...newEvent, location: text })}
                placeholder="Ex: Escritório - Sala 3"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Participantes</Text>
              <TextInput
                style={styles.input}
                value={newEvent.participants}
                onChangeText={(text) => setNewEvent({ ...newEvent, participants: text })}
                placeholder="Separados por vírgula"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notas</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newEvent.notes}
                onChangeText={(text) => setNewEvent({ ...newEvent, notes: text })}
                placeholder="Informações adicionais"
                placeholderTextColor={Colors.text.tertiary}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 16,
  },
  tabSelector: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: Colors.background,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.primary,
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text.inverse,
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
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.tertiary,
  },
  emptyButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text.inverse,
  },
  itemsList: {
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
  dateItems: {
    gap: 12,
    paddingLeft: 80,
  },
  cardWrapper: {
    position: "relative",
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
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
  checkbox: {
    paddingTop: 2,
  },
  cardContent: {
    flex: 1,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  cardTitleCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  typeBadge: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
    textTransform: "uppercase",
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  eventDetails: {
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
  },
  caseInfo: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  processInfo: {
    fontSize: 13,
    color: Colors.text.tertiary,
  },
  notes: {
    fontSize: 14,
    color: Colors.text.primary,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  deleteButton: {
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
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  modalCancel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  modalSave: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  formGroupHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text.primary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
  },
  typeOptionTextActive: {
    color: Colors.text.inverse,
  },
});
