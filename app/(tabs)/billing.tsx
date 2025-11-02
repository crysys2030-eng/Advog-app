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
import { useBilling } from "@/contexts/BillingContext";
import Colors from "@/constants/colors";
import {
  DollarSign,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  X,
  Calendar,
  Trash2,
} from "lucide-react-native";
import { Billing, BillingType, BillingStatus } from "@/types/billing";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BillingScreen() {
  const insets = useSafeAreaInsets();
  const { billings, stats, addBilling, deleteBilling, addPayment } = useBilling();
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  const [filterStatus, setFilterStatus] = useState<BillingStatus | "all">("all");

  const [formData, setFormData] = useState({
    clientName: "",
    description: "",
    type: "fixed" as BillingType,
    amount: "",
    dueDate: "",
    notes: "",
  });

  const [paymentData, setPaymentData] = useState({
    amount: "",
    method: "",
    notes: "",
  });

  const handleAddBilling = () => {
    if (!formData.clientName || !formData.description || !formData.amount) {
      Alert.alert("Erro", "Preencha os campos obrigatórios");
      return;
    }

    addBilling({
      clientId: "",
      clientName: formData.clientName,
      description: formData.description,
      type: formData.type,
      amount: parseFloat(formData.amount),
      status: "pending",
      issueDate: new Date().toISOString(),
      dueDate: formData.dueDate || new Date().toISOString(),
      notes: formData.notes,
    });

    setFormData({
      clientName: "",
      description: "",
      type: "fixed",
      amount: "",
      dueDate: "",
      notes: "",
    });
    setModalVisible(false);
  };

  const handleAddPayment = () => {
    if (!selectedBilling || !paymentData.amount) {
      Alert.alert("Erro", "Preencha o valor do pagamento");
      return;
    }

    addPayment(selectedBilling.id, {
      amount: parseFloat(paymentData.amount),
      date: new Date().toISOString(),
      method: paymentData.method || "Não especificado",
      notes: paymentData.notes,
    });

    setPaymentData({ amount: "", method: "", notes: "" });
    setPaymentModalVisible(false);
    setSelectedBilling(null);
  };

  const handleDelete = (id: string, description: string) => {
    Alert.alert("Confirmar exclusão", `Deseja excluir "${description}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => deleteBilling(id),
      },
    ]);
  };

  const openPaymentModal = (billing: Billing) => {
    setSelectedBilling(billing);
    setPaymentData({
      amount: (billing.amount - billing.paidAmount).toFixed(2),
      method: "",
      notes: "",
    });
    setPaymentModalVisible(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: BillingStatus) => {
    const colors = {
      pending: Colors.warning,
      paid: Colors.success,
      overdue: Colors.danger,
      cancelled: Colors.text.tertiary,
    };
    return colors[status];
  };

  const getStatusLabel = (status: BillingStatus) => {
    const labels = {
      pending: "Pendente",
      paid: "Pago",
      overdue: "Atrasado",
      cancelled: "Cancelado",
    };
    return labels[status];
  };

  const getTypeLabel = (type: BillingType) => {
    const labels = {
      hourly: "Por Hora",
      fixed: "Valor Fixo",
      success_fee: "Êxito",
      subscription: "Assinatura",
    };
    return labels[type];
  };

  const filteredBillings = filterStatus === "all" 
    ? billings 
    : billings.filter(b => b.status === filterStatus);

  return (
    <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View>
            <Text style={styles.title}>Honorários</Text>
            <Text style={styles.subtitle}>Gestão financeira</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Plus size={24} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: Colors.primary }]}>
              <DollarSign size={20} color={Colors.text.inverse} />
              <Text style={styles.statValue}>{formatCurrency(stats.totalAmount)}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: Colors.success }]}>
              <TrendingUp size={20} color={Colors.text.inverse} />
              <Text style={styles.statValue}>{formatCurrency(stats.paidAmount)}</Text>
              <Text style={styles.statLabel}>Recebido</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: Colors.warning }]}>
              <TrendingDown size={20} color={Colors.text.inverse} />
              <Text style={styles.statValue}>{formatCurrency(stats.pendingAmount)}</Text>
              <Text style={styles.statLabel}>Pendente</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: Colors.danger }]}>
              <AlertCircle size={20} color={Colors.text.inverse} />
              <Text style={styles.statValue}>{formatCurrency(stats.overdueAmount)}</Text>
              <Text style={styles.statLabel}>Atrasado</Text>
            </View>
          </View>

          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.filterChip, filterStatus === "all" && styles.filterChipActive]}
                onPress={() => setFilterStatus("all")}
              >
                <Text style={[styles.filterText, filterStatus === "all" && styles.filterTextActive]}>
                  Todos ({billings.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterStatus === "pending" && styles.filterChipActive]}
                onPress={() => setFilterStatus("pending")}
              >
                <Text style={[styles.filterText, filterStatus === "pending" && styles.filterTextActive]}>
                  Pendente ({stats.pending})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterStatus === "paid" && styles.filterChipActive]}
                onPress={() => setFilterStatus("paid")}
              >
                <Text style={[styles.filterText, filterStatus === "paid" && styles.filterTextActive]}>
                  Pago ({stats.paid})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterStatus === "overdue" && styles.filterChipActive]}
                onPress={() => setFilterStatus("overdue")}
              >
                <Text style={[styles.filterText, filterStatus === "overdue" && styles.filterTextActive]}>
                  Atrasado ({stats.overdue})
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {filteredBillings.length === 0 ? (
            <View style={styles.emptyState}>
              <DollarSign size={64} color={Colors.text.tertiary} />
              <Text style={styles.emptyText}>Nenhum honorário encontrado</Text>
            </View>
          ) : (
            <View style={styles.billingsList}>
              {filteredBillings.map((billing) => (
                <View key={billing.id} style={styles.billingCard}>
                  <View style={styles.billingHeader}>
                    <View style={styles.billingTitleRow}>
                      <Text style={styles.billingClient}>{billing.clientName}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(billing.status) },
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {getStatusLabel(billing.status)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.billingDescription}>{billing.description}</Text>
                  </View>

                  <View style={styles.billingDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tipo:</Text>
                      <Text style={styles.detailValue}>{getTypeLabel(billing.type)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Valor:</Text>
                      <Text style={[styles.detailValue, styles.amountText]}>
                        {formatCurrency(billing.amount)}
                      </Text>
                    </View>
                    {billing.paidAmount > 0 && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Pago:</Text>
                        <Text style={[styles.detailValue, { color: Colors.success }]}>
                          {formatCurrency(billing.paidAmount)}
                        </Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Calendar size={14} color={Colors.text.tertiary} />
                      <Text style={styles.dateText}>
                        Vencimento: {formatDate(billing.dueDate)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.billingActions}>
                    {billing.status === "pending" && (
                      <TouchableOpacity
                        style={styles.payButton}
                        onPress={() => openPaymentModal(billing)}
                      >
                        <CheckCircle2 size={18} color={Colors.text.inverse} />
                        <Text style={styles.payButtonText}>Registrar Pagamento</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(billing.id, billing.description)}
                    >
                      <Trash2 size={18} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
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
              <Text style={styles.modalTitle}>Novo Honorário</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Cliente *</Text>
              <TextInput
                style={styles.input}
                value={formData.clientName}
                onChangeText={(text) =>
                  setFormData({ ...formData, clientName: text })
                }
                placeholder="Nome do cliente"
                placeholderTextColor={Colors.text.tertiary}
              />

              <Text style={styles.inputLabel}>Descrição *</Text>
              <TextInput
                style={styles.input}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Descrição do serviço"
                placeholderTextColor={Colors.text.tertiary}
              />

              <Text style={styles.inputLabel}>Tipo</Text>
              <View style={styles.typeSelector}>
                {(["fixed", "hourly", "success_fee", "subscription"] as BillingType[]).map(
                  (type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        formData.type === type && styles.typeOptionActive,
                      ]}
                      onPress={() => setFormData({ ...formData, type })}
                    >
                      <Text
                        style={[
                          styles.typeText,
                          formData.type === type && styles.typeTextActive,
                        ]}
                      >
                        {getTypeLabel(type)}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <Text style={styles.inputLabel}>Valor (€) *</Text>
              <TextInput
                style={styles.input}
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                placeholder="0.00"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>Data de Vencimento</Text>
              <TextInput
                style={styles.input}
                value={formData.dueDate}
                onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.text.tertiary}
              />

              <Text style={styles.inputLabel}>Observações</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Observações adicionais"
                placeholderTextColor={Colors.text.tertiary}
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddBilling}>
              <Text style={styles.submitButtonText}>Adicionar Honorário</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Pagamento</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <X size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            {selectedBilling && (
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentInfoText}>
                  Cliente: {selectedBilling.clientName}
                </Text>
                <Text style={styles.paymentInfoText}>
                  Valor total: {formatCurrency(selectedBilling.amount)}
                </Text>
                <Text style={styles.paymentInfoText}>
                  Já pago: {formatCurrency(selectedBilling.paidAmount)}
                </Text>
                <Text style={[styles.paymentInfoText, styles.paymentInfoHighlight]}>
                  Restante: {formatCurrency(selectedBilling.amount - selectedBilling.paidAmount)}
                </Text>
              </View>
            )}

            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Valor do Pagamento (€) *</Text>
              <TextInput
                style={styles.input}
                value={paymentData.amount}
                onChangeText={(text) =>
                  setPaymentData({ ...paymentData, amount: text })
                }
                placeholder="0.00"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>Método de Pagamento</Text>
              <TextInput
                style={styles.input}
                value={paymentData.method}
                onChangeText={(text) =>
                  setPaymentData({ ...paymentData, method: text })
                }
                placeholder="Ex: Transferência, Dinheiro, etc."
                placeholderTextColor={Colors.text.tertiary}
              />

              <Text style={styles.inputLabel}>Observações</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={paymentData.notes}
                onChangeText={(text) =>
                  setPaymentData({ ...paymentData, notes: text })
                }
                placeholder="Observações sobre o pagamento"
                placeholderTextColor={Colors.text.tertiary}
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddPayment}>
              <Text style={styles.submitButtonText}>Confirmar Pagamento</Text>
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text.inverse,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.inverse,
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
  billingsList: {
    gap: 16,
  },
  billingCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  billingHeader: {
    marginBottom: 12,
  },
  billingTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  billingClient: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text.inverse,
  },
  billingDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  billingDetails: {
    gap: 8,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontWeight: "600" as const,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  dateText: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  billingActions: {
    flexDirection: "row",
    gap: 8,
  },
  payButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: 12,
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.inverse,
  },
  deleteButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dangerLight,
    borderRadius: 12,
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
    maxHeight: "90%",
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
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "600" as const,
  },
  typeTextActive: {
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
  paymentInfo: {
    backgroundColor: Colors.primaryLight,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    gap: 6,
  },
  paymentInfoText: {
    fontSize: 14,
    color: Colors.text.inverse,
  },
  paymentInfoHighlight: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginTop: 8,
  },
});
