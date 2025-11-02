import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { useState } from "react";
import { useDocuments } from "@/contexts/DocumentContext";
import { useCases } from "@/contexts/CaseContext";
import Colors from "@/constants/colors";
import { Search, Plus, FileText, Folder, X, Trash2, Download, Calendar as CalendarIcon, Edit } from "lucide-react-native";
import { DocumentCategory, Document } from "@/types/document";

export default function DocumentsScreen() {
  const { documents, addDocument, deleteDocument, updateDocument, stats } = useDocuments();
  const { cases } = useCases();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | "all">("all");
  const [newDocument, setNewDocument] = useState({
    title: "",
    category: "documento_processual" as DocumentCategory,
    description: "",
    caseId: "",
    clientId: "",
    fileName: "",
    tags: "",
  });

  const filteredDocuments = documents.filter((d) => {
    const matchesSearch = 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === "all" || d.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (category: DocumentCategory) => {
    const labels: Record<DocumentCategory, string> = {
      peticao: "Petição",
      decisao: "Decisão",
      documento_processual: "Documento Processual",
      contrato: "Contrato",
      procuracao: "Procuração",
      outro: "Outro",
    };
    return labels[category];
  };

  const getCategoryColor = (category: DocumentCategory) => {
    const colors: Record<DocumentCategory, string> = {
      peticao: Colors.status.active,
      decisao: Colors.status.urgent,
      documento_processual: Colors.status.pending,
      contrato: Colors.primary,
      procuracao: Colors.warning,
      outro: Colors.text.tertiary,
    };
    return colors[category];
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "—";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDeleteDocument = (id: string, title: string) => {
    Alert.alert(
      "Eliminar Documento",
      `Tem certeza que deseja eliminar o documento "${title}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteDocument(id),
        },
      ]
    );
  };

  const handleAddDocument = () => {
    if (!newDocument.title.trim() || !newDocument.caseId) {
      Alert.alert("Erro", "Por favor, preencha o título e selecione um processo.");
      return;
    }

    const tags = newDocument.tags
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (editingDocument) {
      updateDocument(editingDocument.id, {
        ...newDocument,
        tags: tags.length > 0 ? tags : undefined,
        clientId: newDocument.clientId || undefined,
      });
    } else {
      addDocument({
        ...newDocument,
        tags: tags.length > 0 ? tags : undefined,
        clientId: newDocument.clientId || undefined,
      });
    }

    setNewDocument({
      title: "",
      category: "documento_processual" as DocumentCategory,
      description: "",
      caseId: "",
      clientId: "",
      fileName: "",
      tags: "",
    });
    setEditingDocument(null);
    setShowAddModal(false);
  };

  const handleEditDocument = (doc: Document) => {
    setEditingDocument(doc);
    setNewDocument({
      title: doc.title,
      category: doc.category,
      description: doc.description || "",
      caseId: doc.caseId,
      clientId: doc.clientId || "",
      fileName: doc.fileName || "",
      tags: doc.tags ? doc.tags.join(", ") : "",
    });
    setShowAddModal(true);
  };

  const getCaseName = (caseId: string) => {
    const caseItem = cases.find(c => c.id === caseId);
    return caseItem?.title || "Processo não encontrado";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <FileText size={20} color={Colors.primary} />
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Folder size={20} color={Colors.status.active} />
            <Text style={styles.statNumber}>{stats.byCategory.peticao}</Text>
            <Text style={styles.statLabel}>Petições</Text>
          </View>
          <View style={styles.statCard}>
            <Folder size={20} color={Colors.status.urgent} />
            <Text style={styles.statNumber}>{stats.byCategory.decisao}</Text>
            <Text style={styles.statLabel}>Decisões</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, filterCategory === "all" && styles.filterChipActive]}
              onPress={() => setFilterCategory("all")}
            >
              <Text style={[styles.filterText, filterCategory === "all" && styles.filterTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
            {(["peticao", "decisao", "documento_processual", "contrato", "procuracao", "outro"] as DocumentCategory[]).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, filterCategory === cat && styles.filterChipActive]}
                onPress={() => setFilterCategory(cat)}
              >
                <Text style={[styles.filterText, filterCategory === cat && styles.filterTextActive]}>
                  {getCategoryLabel(cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar documentos..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filteredDocuments.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={48} color={Colors.text.tertiary} />
            <Text style={styles.emptyText}>
              {searchQuery ? "Nenhum documento encontrado" : "Nenhum documento cadastrado"}
            </Text>
          </View>
        ) : (
          <View style={styles.documentsList}>
            {filteredDocuments.map((doc) => (
              <View key={doc.id} style={styles.documentCardWrapper}>
                <TouchableOpacity style={styles.documentCard}>
                  <View style={styles.documentHeader}>
                    <View 
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: getCategoryColor(doc.category) + "20" }
                      ]}
                    >
                      <FileText size={24} color={getCategoryColor(doc.category)} />
                    </View>
                    <View style={styles.documentHeaderText}>
                      <Text style={styles.documentTitle}>{doc.title}</Text>
                      <View style={styles.categoryBadge}>
                        <Text style={[styles.categoryText, { color: getCategoryColor(doc.category) }]}>
                          {getCategoryLabel(doc.category)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {doc.description && (
                    <Text style={styles.documentDescription} numberOfLines={2}>
                      {doc.description}
                    </Text>
                  )}

                  <View style={styles.documentInfo}>
                    <View style={styles.infoChip}>
                      <Folder size={14} color={Colors.text.tertiary} />
                      <Text style={styles.infoChipText} numberOfLines={1}>
                        {getCaseName(doc.caseId)}
                      </Text>
                    </View>
                    {doc.fileName && (
                      <View style={styles.infoChip}>
                        <Download size={14} color={Colors.text.tertiary} />
                        <Text style={styles.infoChipText}>{doc.fileName}</Text>
                      </View>
                    )}
                    <View style={styles.infoChip}>
                      <CalendarIcon size={14} color={Colors.text.tertiary} />
                      <Text style={styles.infoChipText}>{formatDate(doc.createdAt)}</Text>
                    </View>
                  </View>

                  {doc.fileSize && (
                    <Text style={styles.fileSize}>{formatFileSize(doc.fileSize)}</Text>
                  )}

                  {doc.tags && doc.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {doc.tags.slice(0, 3).map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditDocument(doc)}
                  activeOpacity={0.7}
                >
                  <Edit size={18} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteDocument(doc.id, doc.title)}
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
            <Text style={styles.modalTitle}>{editingDocument ? "Editar Documento" : "Novo Documento"}</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.closeButton}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Nome do documento"
                placeholderTextColor={Colors.text.tertiary}
                value={newDocument.title}
                onChangeText={(text) => setNewDocument({ ...newDocument, title: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Categoria *</Text>
              <View style={styles.categorySelector}>
                {(["peticao", "decisao", "documento_processual", "contrato", "procuracao", "outro"] as DocumentCategory[]).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      newDocument.category === cat && styles.categoryOptionSelected,
                    ]}
                    onPress={() => setNewDocument({ ...newDocument, category: cat })}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        newDocument.category === cat && styles.categoryOptionTextSelected,
                      ]}
                    >
                      {getCategoryLabel(cat)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Processo *</Text>
              <ScrollView style={styles.caseSelector} nestedScrollEnabled>
                {cases.map((caseItem) => (
                  <TouchableOpacity
                    key={caseItem.id}
                    style={[
                      styles.caseOption,
                      newDocument.caseId === caseItem.id && styles.caseOptionSelected,
                    ]}
                    onPress={() => setNewDocument({ ...newDocument, caseId: caseItem.id })}
                  >
                    <Text
                      style={[
                        styles.caseOptionText,
                        newDocument.caseId === caseItem.id && styles.caseOptionTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {caseItem.title}
                    </Text>
                    <Text style={styles.caseOptionSubtext}>{caseItem.processNumber}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nome do Arquivo</Text>
              <TextInput
                style={styles.textInput}
                placeholder="documento.pdf"
                placeholderTextColor={Colors.text.tertiary}
                value={newDocument.fileName}
                onChangeText={(text) => setNewDocument({ ...newDocument, fileName: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Descreva o documento..."
                placeholderTextColor={Colors.text.tertiary}
                value={newDocument.description}
                onChangeText={(text) => setNewDocument({ ...newDocument, description: text })}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tags (separadas por vírgula)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="urgente, importante, revisão"
                placeholderTextColor={Colors.text.tertiary}
                value={newDocument.tags}
                onChangeText={(text) => setNewDocument({ ...newDocument, tags: text })}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleAddDocument}>
              <Text style={styles.saveButtonText}>{editingDocument ? "Salvar Alterações" : "Adicionar Documento"}</Text>
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
    gap: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  filterScroll: {
    maxHeight: 40,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: Colors.text.inverse,
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
  documentsList: {
    gap: 16,
  },
  documentCardWrapper: {
    position: "relative",
  },
  documentCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  documentHeader: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  documentHeaderText: {
    flex: 1,
    gap: 6,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  categoryBadge: {
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "uppercase",
  },
  documentDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  documentInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: "48%",
  },
  infoChipText: {
    fontSize: 12,
    color: Colors.text.secondary,
    flex: 1,
  },
  fileSize: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontWeight: "600" as const,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: "600" as const,
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
  categorySelector: {
    gap: 8,
  },
  categoryOption: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  categoryOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
  },
  categoryOptionTextSelected: {
    color: Colors.text.inverse,
  },
  caseSelector: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  caseOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  caseOptionSelected: {
    backgroundColor: Colors.primary + "20",
  },
  caseOptionText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  caseOptionTextSelected: {
    color: Colors.primary,
  },
  caseOptionSubtext: {
    fontSize: 12,
    color: Colors.text.tertiary,
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
