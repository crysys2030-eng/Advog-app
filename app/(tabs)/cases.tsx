import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { useState } from "react";
import { useCases } from "@/contexts/CaseContext";
import Colors from "@/constants/colors";
import { Search, Plus, AlertCircle, X, Trash2, Edit } from "lucide-react-native";
import { Link } from "expo-router";
import { CaseStatus, CasePriority, Case } from "@/types/case";

export default function CasesScreen() {
  const { cases, addCase, deleteCase, updateCase } = useCases();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [newCase, setNewCase] = useState({
    title: "",
    client: "",
    processNumber: "",
    description: "",
    entity: "",
    subject: "",
    status: "active" as CaseStatus,
    priority: "medium" as CasePriority,
  });

  const filteredCases = cases.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.processNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Ativo",
      pending: "Pendente",
      completed: "Concluído",
      urgent: "Urgente",
    };
    return labels[status] || status;
  };

  const handleDeleteCase = (id: string, title: string) => {
    Alert.alert(
      "Eliminar Processo",
      `Tem certeza que deseja eliminar o processo "${title}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteCase(id),
        },
      ]
    );
  };

  const handleAddCase = () => {
    if (!newCase.title.trim() || !newCase.client.trim() || !newCase.processNumber.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios: Título, Cliente e Número do Processo.");
      return;
    }

    if (editingCase) {
      updateCase(editingCase.id, newCase);
    } else {
      addCase({
        ...newCase,
        deadlines: [],
      });
    }

    setNewCase({
      title: "",
      client: "",
      processNumber: "",
      description: "",
      entity: "",
      subject: "",
      status: "active" as CaseStatus,
      priority: "medium" as CasePriority,
    });
    setEditingCase(null);
    setShowAddModal(false);
  };

  const handleEditCase = (caseItem: Case) => {
    setEditingCase(caseItem);
    setNewCase({
      title: caseItem.title,
      client: caseItem.client,
      processNumber: caseItem.processNumber,
      description: caseItem.description,
      entity: caseItem.entity,
      subject: caseItem.subject,
      status: caseItem.status,
      priority: caseItem.priority,
    });
    setShowAddModal(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar processos..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filteredCases.length === 0 ? (
          <View style={styles.emptyState}>
            <AlertCircle size={48} color={Colors.text.tertiary} />
            <Text style={styles.emptyText}>
              {searchQuery ? "Nenhum processo encontrado" : "Nenhum processo cadastrado"}
            </Text>
          </View>
        ) : (
          <View style={styles.casesList}>
            {filteredCases.map((caseItem) => (
              <View key={caseItem.id} style={styles.caseCardWrapper}>
                  <TouchableOpacity style={styles.caseCard}>
                  <View style={styles.caseHeader}>
                    <View
                      style={[
                        styles.statusIndicator,
                        { backgroundColor: Colors.status[caseItem.status] },
                      ]}
                    />
                    <View style={styles.caseHeaderText}>
                      <Text style={styles.caseTitle} numberOfLines={2}>
                        {caseItem.title}
                      </Text>
                      <Text style={styles.statusLabel}>{getStatusLabel(caseItem.status)}</Text>
                    </View>
                  </View>

                  <View style={styles.caseInfo}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Cliente:</Text>
                      <Text style={styles.infoValue}>{caseItem.client}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Processo:</Text>
                      <Text style={styles.infoValue}>{caseItem.processNumber}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Órgão:</Text>
                      <Text style={styles.infoValue}>{caseItem.entity}</Text>
                    </View>
                  </View>

                    {caseItem.deadlines.filter((d) => !d.completed).length > 0 && (
                      <View style={styles.deadlinesTag}>
                        <Text style={styles.deadlinesTagText}>
                          {caseItem.deadlines.filter((d) => !d.completed).length} prazo(s) ativo(s)
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditCase(caseItem)}
                  activeOpacity={0.7}
                >
                  <Edit size={18} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteCase(caseItem.id, caseItem.title)}
                  activeOpacity={0.7}
                >
                  <Trash2 size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => setShowAddModal(true)}>
        <Plus size={28} color={Colors.text.inverse} />
      </TouchableOpacity>

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingCase ? "Editar Processo" : "Novo Processo"}</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.closeButton}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Recurso Administrativo - Licença"
                placeholderTextColor={Colors.text.tertiary}
                value={newCase.title}
                onChangeText={(text) => setNewCase({ ...newCase, title: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Cliente *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Nome do cliente"
                placeholderTextColor={Colors.text.tertiary}
                value={newCase.client}
                onChangeText={(text) => setNewCase({ ...newCase, client: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Número do Processo *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="1234567-89.2024.8.02.0001"
                placeholderTextColor={Colors.text.tertiary}
                value={newCase.processNumber}
                onChangeText={(text) => setNewCase({ ...newCase, processNumber: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Órgão</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Secretaria de Meio Ambiente"
                placeholderTextColor={Colors.text.tertiary}
                value={newCase.entity}
                onChangeText={(text) => setNewCase({ ...newCase, entity: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Assunto</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Licenciamento Ambiental"
                placeholderTextColor={Colors.text.tertiary}
                value={newCase.subject}
                onChangeText={(text) => setNewCase({ ...newCase, subject: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Descreva o caso..."
                placeholderTextColor={Colors.text.tertiary}
                value={newCase.description}
                onChangeText={(text) => setNewCase({ ...newCase, description: text })}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.pickerContainer}>
                  {["active", "pending", "urgent", "completed"].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.pickerOption,
                        newCase.status === status && styles.pickerOptionSelected,
                      ]}
                      onPress={() => setNewCase({ ...newCase, status: status as CaseStatus })}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          newCase.status === status && styles.pickerOptionTextSelected,
                        ]}
                      >
                        {getStatusLabel(status)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Prioridade</Text>
                <View style={styles.pickerContainer}>
                  {["low", "medium", "high", "urgent"].map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.pickerOption,
                        newCase.priority === priority && styles.pickerOptionSelected,
                      ]}
                      onPress={() => setNewCase({ ...newCase, priority: priority as CasePriority })}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          newCase.priority === priority && styles.pickerOptionTextSelected,
                        ]}
                      >
                        {priority === "low" ? "Baixa" : priority === "medium" ? "Média" : priority === "high" ? "Alta" : "Urgente"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleAddCase}>
              <Text style={styles.saveButtonText}>{editingCase ? "Salvar Alterações" : "Adicionar Processo"}</Text>
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
    backgroundColor: Colors.background,
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
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
  casesList: {
    gap: 16,
  },
  caseCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  caseHeader: {
    flexDirection: "row",
    gap: 12,
  },
  statusIndicator: {
    width: 4,
    borderRadius: 2,
  },
  caseHeaderText: {
    flex: 1,
    gap: 8,
  },
  caseTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  caseInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "600" as const,
    minWidth: 70,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
  },
  deadlinesTag: {
    alignSelf: "flex-start",
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deadlinesTagText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text.inverse,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  caseCardWrapper: {
    position: "relative",
  },
  editButton: {
    position: "absolute",
    top: 12,
    right: 56,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 10,
  },
  deleteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
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
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
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
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    gap: 8,
  },
  pickerOption: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  pickerOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
  },
  pickerOptionTextSelected: {
    color: Colors.text.inverse,
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text.inverse,
  },
});
