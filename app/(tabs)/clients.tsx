import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { useState } from "react";
import { useClients } from "@/contexts/ClientContext";
import Colors from "@/constants/colors";
import { Search, Plus, Users, Building2, User, X, Trash2, Mail, Phone, MapPin, FileText, Edit } from "lucide-react-native";
import { ClientType, Client } from "@/types/client";

export default function ClientsScreen() {
  const { clients, addClient, deleteClient, updateClient, stats } = useClients();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [filterType, setFilterType] = useState<ClientType | "all">("all");
  const [newClient, setNewClient] = useState({
    name: "",
    type: "individual" as ClientType,
    email: "",
    phone: "",
    document: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
  });

  const filteredClients = clients.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.document.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || c.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleDeleteClient = (id: string, name: string) => {
    Alert.alert(
      "Eliminar Cliente",
      `Tem certeza que deseja eliminar o cliente "${name}"? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteClient(id),
        },
      ]
    );
  };

  const handleAddClient = () => {
    if (!newClient.name.trim() || !newClient.email.trim() || !newClient.phone.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios: Nome, Email e Telefone.");
      return;
    }

    if (editingClient) {
      updateClient(editingClient.id, newClient);
    } else {
      addClient(newClient);
    }

    setNewClient({
      name: "",
      type: "individual" as ClientType,
      email: "",
      phone: "",
      document: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      notes: "",
    });
    setEditingClient(null);
    setShowAddModal(false);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      type: client.type,
      email: client.email,
      phone: client.phone,
      document: client.document,
      address: client.address || "",
      city: client.city || "",
      state: client.state || "",
      zipCode: client.zipCode || "",
      notes: client.notes || "",
    });
    setShowAddModal(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Users size={20} color={Colors.primary} />
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <User size={20} color={Colors.status.active} />
            <Text style={styles.statNumber}>{stats.individuals}</Text>
            <Text style={styles.statLabel}>Individuais</Text>
          </View>
          <View style={styles.statCard}>
            <Building2 size={20} color={Colors.status.pending} />
            <Text style={styles.statNumber}>{stats.companies}</Text>
            <Text style={styles.statLabel}>Empresas</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, filterType === "all" && styles.filterChipActive]}
            onPress={() => setFilterType("all")}
          >
            <Text style={[styles.filterText, filterType === "all" && styles.filterTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === "individual" && styles.filterChipActive]}
            onPress={() => setFilterType("individual")}
          >
            <Text style={[styles.filterText, filterType === "individual" && styles.filterTextActive]}>
              Individuais
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === "company" && styles.filterChipActive]}
            onPress={() => setFilterType("company")}
          >
            <Text style={[styles.filterText, filterType === "company" && styles.filterTextActive]}>
              Empresas
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar clientes..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filteredClients.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color={Colors.text.tertiary} />
            <Text style={styles.emptyText}>
              {searchQuery ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
            </Text>
          </View>
        ) : (
          <View style={styles.clientsList}>
            {filteredClients.map((client) => (
              <View key={client.id} style={styles.clientCardWrapper}>
                <View style={styles.clientCard}>
                  <View style={styles.clientHeader}>
                    <View style={styles.clientIcon}>
                      {client.type === "company" ? (
                        <Building2 size={24} color={Colors.primary} />
                      ) : (
                        <User size={24} color={Colors.primary} />
                      )}
                    </View>
                    <View style={styles.clientHeaderText}>
                      <Text style={styles.clientName}>{client.name}</Text>
                      <View style={styles.clientTypeBadge}>
                        <Text style={styles.clientTypeText}>
                          {client.type === "company" ? "Empresa" : "Individual"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.clientInfo}>
                    <View style={styles.infoRow}>
                      <Mail size={16} color={Colors.text.tertiary} />
                      <Text style={styles.infoText}>{client.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Phone size={16} color={Colors.text.tertiary} />
                      <Text style={styles.infoText}>{client.phone}</Text>
                    </View>
                    {client.document && (
                      <View style={styles.infoRow}>
                        <FileText size={16} color={Colors.text.tertiary} />
                        <Text style={styles.infoText}>{client.document}</Text>
                      </View>
                    )}
                    {(client.city || client.state) && (
                      <View style={styles.infoRow}>
                        <MapPin size={16} color={Colors.text.tertiary} />
                        <Text style={styles.infoText}>
                          {[client.city, client.state].filter(Boolean).join(", ")}
                        </Text>
                      </View>
                    )}
                  </View>

                  {client.activeCases > 0 && (
                    <View style={styles.casesTag}>
                      <Text style={styles.casesTagText}>
                        {client.activeCases} processo{client.activeCases !== 1 ? "s" : ""} ativo{client.activeCases !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditClient(client)}
                  activeOpacity={0.7}
                >
                  <Edit size={18} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteClient(client.id, client.name)}
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
            <Text style={styles.modalTitle}>{editingClient ? "Editar Cliente" : "Novo Cliente"}</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.closeButton}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tipo de Cliente *</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    newClient.type === "individual" && styles.typeOptionSelected,
                  ]}
                  onPress={() => setNewClient({ ...newClient, type: "individual" })}
                >
                  <User size={20} color={newClient.type === "individual" ? Colors.text.inverse : Colors.text.secondary} />
                  <Text
                    style={[
                      styles.typeOptionText,
                      newClient.type === "individual" && styles.typeOptionTextSelected,
                    ]}
                  >
                    Individual
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    newClient.type === "company" && styles.typeOptionSelected,
                  ]}
                  onPress={() => setNewClient({ ...newClient, type: "company" })}
                >
                  <Building2 size={20} color={newClient.type === "company" ? Colors.text.inverse : Colors.text.secondary} />
                  <Text
                    style={[
                      styles.typeOptionText,
                      newClient.type === "company" && styles.typeOptionTextSelected,
                    ]}
                  >
                    Empresa
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nome *</Text>
              <TextInput
                style={styles.textInput}
                placeholder={newClient.type === "company" ? "Nome da empresa" : "Nome completo"}
                placeholderTextColor={Colors.text.tertiary}
                value={newClient.name}
                onChangeText={(text) => setNewClient({ ...newClient, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="email@exemplo.com"
                placeholderTextColor={Colors.text.tertiary}
                value={newClient.email}
                onChangeText={(text) => setNewClient({ ...newClient, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Telefone *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="+351 21 123 4567"
                placeholderTextColor={Colors.text.tertiary}
                value={newClient.phone}
                onChangeText={(text) => setNewClient({ ...newClient, phone: text })}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {newClient.type === "company" ? "NIF/NIPC" : "NIF"}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={newClient.type === "company" ? "12.345.678/0001-90" : "123.456.789-00"}
                placeholderTextColor={Colors.text.tertiary}
                value={newClient.document}
                onChangeText={(text) => setNewClient({ ...newClient, document: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Endereço</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Rua, número, complemento"
                placeholderTextColor={Colors.text.tertiary}
                value={newClient.address}
                onChangeText={(text) => setNewClient({ ...newClient, address: text })}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 2 }]}>
                <Text style={styles.label}>Cidade</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Lisboa"
                  placeholderTextColor={Colors.text.tertiary}
                  value={newClient.city}
                  onChangeText={(text) => setNewClient({ ...newClient, city: text })}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Distrito</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Lisboa"
                  placeholderTextColor={Colors.text.tertiary}
                  value={newClient.state}
                  onChangeText={(text) => setNewClient({ ...newClient, state: text })}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Código Postal</Text>
              <TextInput
                style={styles.textInput}
                placeholder="1000-001"
                placeholderTextColor={Colors.text.tertiary}
                value={newClient.zipCode}
                onChangeText={(text) => setNewClient({ ...newClient, zipCode: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notas</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Informações adicionais sobre o cliente..."
                placeholderTextColor={Colors.text.tertiary}
                value={newClient.notes}
                onChangeText={(text) => setNewClient({ ...newClient, notes: text })}
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleAddClient}>
              <Text style={styles.saveButtonText}>{editingClient ? "Salvar Alterações" : "Adicionar Cliente"}</Text>
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
  clientsList: {
    gap: 16,
  },
  clientCardWrapper: {
    position: "relative",
  },
  clientCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clientHeader: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  clientIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  clientHeaderText: {
    flex: 1,
    gap: 6,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  clientTypeBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clientTypeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
    textTransform: "uppercase",
  },
  clientInfo: {
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  casesTag: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  casesTagText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text.inverse,
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
  typeSelector: {
    flexDirection: "row",
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 16,
  },
  typeOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeOptionText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
  },
  typeOptionTextSelected: {
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
