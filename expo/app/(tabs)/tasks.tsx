import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { useState } from "react";
import { useTasks } from "@/contexts/TaskContext";
import Colors from "@/constants/colors";
import {
  ListTodo,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  X,
  Trash2,
  PlayCircle,
} from "lucide-react-native";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { tasks, stats, addTask, updateTask, deleteTask } = useTasks();
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    dueDate: "",
  });

  const handleAddTask = () => {
    if (!formData.title) {
      Alert.alert("Erro", "Preencha o título da tarefa");
      return;
    }

    addTask({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: "todo",
      dueDate: formData.dueDate || undefined,
    });

    setFormData({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
    });
    setModalVisible(false);
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert("Confirmar exclusão", `Deseja excluir "${title}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => deleteTask(id),
      },
    ]);
  };

  const toggleTaskStatus = (task: Task) => {
    if (task.status === "completed") {
      updateTask(task.id, { status: "todo" });
    } else if (task.status === "todo") {
      updateTask(task.id, { status: "in_progress" });
    } else {
      updateTask(task.id, { status: "completed" });
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      low: Colors.info,
      medium: Colors.warning,
      high: Colors.danger,
      urgent: Colors.status.urgent,
    };
    return colors[priority];
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    const labels = {
      low: "Baixa",
      medium: "Média",
      high: "Alta",
      urgent: "Urgente",
    };
    return labels[priority];
  };

  const getStatusIcon = (status: TaskStatus) => {
    if (status === "completed") return CheckCircle2;
    if (status === "in_progress") return PlayCircle;
    return Circle;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  const filteredTasks = filterStatus === "all" 
    ? tasks 
    : tasks.filter(t => t.status === filterStatus);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.title}>Tarefas</Text>
          <Text style={styles.subtitle}>Gestão de atividades</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={24} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsRow}>
          <View style={[styles.miniStat, { backgroundColor: Colors.info }]}>
            <Text style={styles.miniStatValue}>{stats.todo}</Text>
            <Text style={styles.miniStatLabel}>A Fazer</Text>
          </View>
          <View style={[styles.miniStat, { backgroundColor: Colors.warning }]}>
            <Text style={styles.miniStatValue}>{stats.inProgress}</Text>
            <Text style={styles.miniStatLabel}>Em Curso</Text>
          </View>
          <View style={[styles.miniStat, { backgroundColor: Colors.success }]}>
            <Text style={styles.miniStatValue}>{stats.completed}</Text>
            <Text style={styles.miniStatLabel}>Concluídas</Text>
          </View>
          <View style={[styles.miniStat, { backgroundColor: Colors.danger }]}>
            <Text style={styles.miniStatValue}>{stats.overdue}</Text>
            <Text style={styles.miniStatLabel}>Atrasadas</Text>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterChip, filterStatus === "all" && styles.filterChipActive]}
              onPress={() => setFilterStatus("all")}
            >
              <Text style={[styles.filterText, filterStatus === "all" && styles.filterTextActive]}>
                Todas ({tasks.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filterStatus === "todo" && styles.filterChipActive]}
              onPress={() => setFilterStatus("todo")}
            >
              <Text style={[styles.filterText, filterStatus === "todo" && styles.filterTextActive]}>
                A Fazer ({stats.todo})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filterStatus === "in_progress" && styles.filterChipActive]}
              onPress={() => setFilterStatus("in_progress")}
            >
              <Text style={[styles.filterText, filterStatus === "in_progress" && styles.filterTextActive]}>
                Em Curso ({stats.inProgress})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filterStatus === "completed" && styles.filterChipActive]}
              onPress={() => setFilterStatus("completed")}
            >
              <Text style={[styles.filterText, filterStatus === "completed" && styles.filterTextActive]}>
                Concluídas ({stats.completed})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <ListTodo size={64} color={Colors.text.tertiary} />
            <Text style={styles.emptyText}>Nenhuma tarefa encontrada</Text>
          </View>
        ) : (
          <View style={styles.tasksList}>
            {filteredTasks.map((task) => {
              const StatusIcon = getStatusIcon(task.status);
              return (
                <View key={task.id} style={styles.taskCard}>
                  <View style={styles.taskMain}>
                    <TouchableOpacity
                      onPress={() => toggleTaskStatus(task)}
                      style={styles.statusButton}
                    >
                      <StatusIcon
                        size={24}
                        color={
                          task.status === "completed"
                            ? Colors.success
                            : task.status === "in_progress"
                            ? Colors.warning
                            : Colors.text.tertiary
                        }
                      />
                    </TouchableOpacity>

                    <View style={styles.taskContent}>
                      <Text
                        style={[
                          styles.taskTitle,
                          task.status === "completed" && styles.taskTitleCompleted,
                        ]}
                      >
                        {task.title}
                      </Text>
                      {task.description && (
                        <Text style={styles.taskDescription} numberOfLines={2}>
                          {task.description}
                        </Text>
                      )}
                      <View style={styles.taskMeta}>
                        <View
                          style={[
                            styles.priorityBadge,
                            { backgroundColor: getPriorityColor(task.priority) },
                          ]}
                        >
                          <Text style={styles.priorityText}>
                            {getPriorityLabel(task.priority)}
                          </Text>
                        </View>
                        {task.dueDate && (
                          <View style={styles.dueDateBadge}>
                            <Clock size={12} color={Colors.text.tertiary} />
                            <Text style={styles.dueDateText}>
                              {formatDate(task.dueDate)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(task.id, task.title)}
                    >
                      <Trash2 size={18} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Tarefa</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Título *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Nome da tarefa"
                placeholderTextColor={Colors.text.tertiary}
              />

              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Detalhes da tarefa"
                placeholderTextColor={Colors.text.tertiary}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.inputLabel}>Prioridade</Text>
              <View style={styles.prioritySelector}>
                {(["low", "medium", "high", "urgent"] as TaskPriority[]).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      formData.priority === priority && styles.priorityOptionActive,
                      { borderColor: getPriorityColor(priority) },
                      formData.priority === priority && {
                        backgroundColor: getPriorityColor(priority),
                      },
                    ]}
                    onPress={() => setFormData({ ...formData, priority })}
                  >
                    <Text
                      style={[
                        styles.priorityOptionText,
                        formData.priority === priority &&
                          styles.priorityOptionTextActive,
                      ]}
                    >
                      {getPriorityLabel(priority)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Data de Vencimento</Text>
              <TextInput
                style={styles.input}
                value={formData.dueDate}
                onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.text.tertiary}
              />
            </ScrollView>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddTask}>
              <Text style={styles.submitButtonText}>Adicionar Tarefa</Text>
            </TouchableOpacity>
          </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  miniStat: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  miniStatValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text.inverse,
  },
  miniStatLabel: {
    fontSize: 10,
    color: Colors.text.inverse,
    marginTop: 2,
    opacity: 0.9,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "600" as const,
  },
  filterTextActive: {
    color: Colors.text.inverse,
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
  tasksList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  taskMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  statusButton: {
    padding: 4,
  },
  taskContent: {
    flex: 1,
    gap: 6,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: Colors.text.tertiary,
  },
  taskDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  taskMeta: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.text.inverse,
  },
  dueDateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 8,
  },
  dueDateText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    fontWeight: "600" as const,
  },
  deleteButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text.primary,
  },
  modalForm: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  prioritySelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  priorityOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 2,
  },
  priorityOptionActive: {
    borderWidth: 2,
  },
  priorityOptionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "600" as const,
  },
  priorityOptionTextActive: {
    color: Colors.text.inverse,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text.inverse,
  },
});
