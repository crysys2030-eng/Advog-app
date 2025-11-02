import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useState, useRef, useEffect } from "react";
import Colors from "@/constants/colors";
import { Send, Sparkles, Loader2 } from "lucide-react-native";
import { useRorkAgent, createRorkTool } from "@rork/toolkit-sdk";
import { z } from "zod";
import { useCases } from "@/contexts/CaseContext";
import { useClients } from "@/contexts/ClientContext";
import { useDocuments } from "@/contexts/DocumentContext";

export default function AssistantScreen() {
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const { cases, addCase, deleteCase, updateCase, addDeadline } = useCases();
  const { clients, addClient, deleteClient, updateClient } = useClients();
  const { documents, addDocument, deleteDocument } = useDocuments();

  const { messages, sendMessage } = useRorkAgent({
    tools: {
      listCases: createRorkTool({
        description: "Listar todos os processos administrativos do escritório",
        zodSchema: z.object({}),
        execute() {
          const casesList = cases.map((c) => ({
            id: c.id,
            title: c.title,
            processNumber: c.processNumber,
            client: c.client,
            status: c.status,
            entity: c.entity,
          }));
          return JSON.stringify({ cases: casesList });
        },
      }),
      getCaseDetails: createRorkTool({
        description: "Obter detalhes completos de um processo específico",
        zodSchema: z.object({
          caseId: z.string().describe("ID do processo"),
        }),
        execute({ caseId }) {
          const caseItem = cases.find((c) => c.id === caseId);
          if (!caseItem) {
            return JSON.stringify({ error: "Processo não encontrado" });
          }
          return JSON.stringify({ case: caseItem });
        },
      }),
      createCase: createRorkTool({
        description: "Criar um novo processo administrativo",
        zodSchema: z.object({
          title: z.string().describe("Título do processo"),
          client: z.string().describe("Nome do cliente"),
          processNumber: z.string().describe("Número do processo"),
          description: z.string().describe("Descrição do caso"),
          entity: z.string().describe("Órgão ou entidade administrativa"),
          subject: z.string().describe("Assunto do processo"),
          status: z.enum(["active", "pending", "completed", "urgent"]).describe("Status inicial"),
          priority: z.enum(["low", "medium", "high", "urgent"]).describe("Prioridade"),
        }),
        execute(data) {
          addCase({
            ...data,
            deadlines: [],
          });
          return JSON.stringify({ success: true, message: "Processo criado com sucesso" });
        },
      }),
      deleteCase: createRorkTool({
        description: "Eliminar um processo administrativo",
        zodSchema: z.object({
          caseId: z.string().describe("ID do processo a eliminar"),
        }),
        execute({ caseId }) {
          const caseItem = cases.find((c) => c.id === caseId);
          if (!caseItem) {
            return JSON.stringify({ error: "Processo não encontrado" });
          }
          deleteCase(caseId);
          return JSON.stringify({ success: true, message: "Processo eliminado com sucesso" });
        },
      }),
      updateCase: createRorkTool({
        description: "Atualizar um processo administrativo",
        zodSchema: z.object({
          caseId: z.string().describe("ID do processo"),
          updates: z.object({
            title: z.string().optional(),
            client: z.string().optional(),
            processNumber: z.string().optional(),
            description: z.string().optional(),
            entity: z.string().optional(),
            subject: z.string().optional(),
            status: z.enum(["active", "pending", "completed", "urgent"]).optional(),
            priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
          }).describe("Campos a atualizar"),
        }),
        execute({ caseId, updates }) {
          const caseItem = cases.find((c) => c.id === caseId);
          if (!caseItem) {
            return JSON.stringify({ error: "Processo não encontrado" });
          }
          updateCase(caseId, updates);
          return JSON.stringify({ success: true, message: "Processo atualizado com sucesso" });
        },
      }),
      addDeadline: createRorkTool({
        description: "Adicionar um prazo a um processo",
        zodSchema: z.object({
          caseId: z.string().describe("ID do processo"),
          title: z.string().describe("Título do prazo"),
          type: z.enum(["audiencia", "recurso", "manifestacao", "peticao", "outro"]).describe("Tipo de prazo"),
          date: z.string().describe("Data do prazo em formato ISO 8601"),
          notes: z.string().optional().describe("Notas sobre o prazo"),
        }),
        execute({ caseId, title, type, date, notes }) {
          const caseItem = cases.find((c) => c.id === caseId);
          if (!caseItem) {
            return JSON.stringify({ error: "Processo não encontrado" });
          }
          addDeadline(caseId, {
            title,
            type,
            date,
            completed: false,
            notes,
          });
          return JSON.stringify({ success: true, message: "Prazo adicionado com sucesso" });
        },
      }),
      listClients: createRorkTool({
        description: "Listar todos os clientes do escritório",
        zodSchema: z.object({}),
        execute() {
          const clientsList = clients.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            email: c.email,
            phone: c.phone,
            activeCases: c.activeCases,
          }));
          return JSON.stringify({ clients: clientsList });
        },
      }),
      getClientDetails: createRorkTool({
        description: "Obter detalhes completos de um cliente específico",
        zodSchema: z.object({
          clientId: z.string().describe("ID do cliente"),
        }),
        execute({ clientId }) {
          const client = clients.find((c) => c.id === clientId);
          if (!client) {
            return JSON.stringify({ error: "Cliente não encontrado" });
          }
          return JSON.stringify({ client });
        },
      }),
      createClient: createRorkTool({
        description: "Criar um novo cliente",
        zodSchema: z.object({
          name: z.string().describe("Nome do cliente ou empresa"),
          type: z.enum(["individual", "company"]).describe("Tipo de cliente"),
          email: z.string().describe("Email do cliente"),
          phone: z.string().describe("Telefone do cliente"),
          document: z.string().optional().describe("Documento (NIF/NIPC)"),
          address: z.string().optional().describe("Endereço"),
          city: z.string().optional().describe("Cidade"),
          state: z.string().optional().describe("Distrito/Estado"),
          zipCode: z.string().optional().describe("Código postal"),
          notes: z.string().optional().describe("Notas adicionais"),
        }),
        execute(data) {
          addClient({
            ...data,
            document: data.document || "",
          });
          return JSON.stringify({ success: true, message: "Cliente criado com sucesso" });
        },
      }),
      updateClient: createRorkTool({
        description: "Atualizar informações de um cliente",
        zodSchema: z.object({
          clientId: z.string().describe("ID do cliente"),
          updates: z.object({
            name: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
            document: z.string().optional(),
            address: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zipCode: z.string().optional(),
            notes: z.string().optional(),
          }).describe("Campos a atualizar"),
        }),
        execute({ clientId, updates }) {
          const client = clients.find((c) => c.id === clientId);
          if (!client) {
            return JSON.stringify({ error: "Cliente não encontrado" });
          }
          updateClient(clientId, updates);
          return JSON.stringify({ success: true, message: "Cliente atualizado com sucesso" });
        },
      }),
      deleteClient: createRorkTool({
        description: "Eliminar um cliente",
        zodSchema: z.object({
          clientId: z.string().describe("ID do cliente a eliminar"),
        }),
        execute({ clientId }) {
          const client = clients.find((c) => c.id === clientId);
          if (!client) {
            return JSON.stringify({ error: "Cliente não encontrado" });
          }
          deleteClient(clientId);
          return JSON.stringify({ success: true, message: "Cliente eliminado com sucesso" });
        },
      }),
      listDocuments: createRorkTool({
        description: "Listar todos os documentos ou documentos de um processo específico",
        zodSchema: z.object({
          caseId: z.string().optional().describe("ID do processo (opcional)"),
        }),
        execute({ caseId }) {
          let filteredDocs = documents;
          if (caseId) {
            filteredDocs = documents.filter((d) => d.caseId === caseId);
          }
          const docsList = filteredDocs.map((d) => ({
            id: d.id,
            title: d.title,
            category: d.category,
            caseId: d.caseId,
            fileName: d.fileName,
            createdAt: d.createdAt,
          }));
          return JSON.stringify({ documents: docsList });
        },
      }),
      createDocument: createRorkTool({
        description: "Criar um novo documento associado a um processo",
        zodSchema: z.object({
          title: z.string().describe("Título do documento"),
          category: z.enum(["peticao", "decisao", "documento_processual", "contrato", "procuracao", "outro"]).describe("Categoria do documento"),
          caseId: z.string().describe("ID do processo"),
          description: z.string().optional().describe("Descrição do documento"),
          fileName: z.string().optional().describe("Nome do arquivo"),
        }),
        execute(data) {
          const caseItem = cases.find((c) => c.id === data.caseId);
          if (!caseItem) {
            return JSON.stringify({ error: "Processo não encontrado" });
          }
          addDocument(data);
          return JSON.stringify({ success: true, message: "Documento criado com sucesso" });
        },
      }),
      deleteDocument: createRorkTool({
        description: "Eliminar um documento",
        zodSchema: z.object({
          documentId: z.string().describe("ID do documento a eliminar"),
        }),
        execute({ documentId }) {
          const document = documents.find((d) => d.id === documentId);
          if (!document) {
            return JSON.stringify({ error: "Documento não encontrado" });
          }
          deleteDocument(documentId);
          return JSON.stringify({ success: true, message: "Documento eliminado com sucesso" });
        },
      }),
    },
  });

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
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
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Sparkles size={48} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Como posso ajudar?</Text>
            <Text style={styles.emptyText}>
              Posso ajudar com análise de casos, prazos, pesquisa jurídica e muito mais
            </Text>
            <View style={styles.suggestions}>
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => setInput("Quais processos estão com prazos próximos?")}
              >
                <Text style={styles.suggestionText}>Prazos próximos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => setInput("Analise o caso de João Silva")}
              >
                <Text style={styles.suggestionText}>Analisar caso</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => setInput("Liste todos os processos urgentes")}
              >
                <Text style={styles.suggestionText}>Processos urgentes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {messages.map((message) => (
          <View key={message.id} style={styles.messageWrapper}>
            {message.parts.map((part, index) => {
              if (part.type === "text") {
                return (
                  <View
                    key={`${message.id}-${index}`}
                    style={[
                      styles.messageBubble,
                      message.role === "user" ? styles.userBubble : styles.assistantBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        message.role === "user" ? styles.userText : styles.assistantText,
                      ]}
                    >
                      {part.text}
                    </Text>
                  </View>
                );
              }

              if (part.type === "tool") {
                if (part.state === "input-streaming" || part.state === "input-available") {
                  return (
                    <View key={`${message.id}-${index}`} style={styles.toolBubble}>
                      <Loader2 size={16} color={Colors.primary} />
                      <Text style={styles.toolText}>Executando: {part.toolName}...</Text>
                    </View>
                  );
                }

                if (part.state === "output-available") {
                  return (
                    <View key={`${message.id}-${index}`} style={styles.toolBubble}>
                      <Text style={styles.toolText}>✓ {part.toolName} executado</Text>
                    </View>
                  );
                }

                if (part.state === "output-error") {
                  return (
                    <View key={`${message.id}-${index}`} style={styles.errorBubble}>
                      <Text style={styles.errorText}>Erro: {part.errorText}</Text>
                    </View>
                  );
                }
              }

              return null;
            })}
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Faça uma pergunta..."
          placeholderTextColor={Colors.text.tertiary}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={1000}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!input.trim()}
          activeOpacity={0.7}
        >
          <Send size={20} color={input.trim() ? Colors.text.inverse : Colors.text.tertiary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  suggestionChip: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 16,
    borderRadius: 16,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: Colors.background,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userText: {
    color: Colors.text.inverse,
  },
  assistantText: {
    color: Colors.text.primary,
  },
  toolBubble: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  toolText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontStyle: "italic",
  },
  errorBubble: {
    alignSelf: "flex-start",
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: Colors.text.inverse,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.surfaceAlt,
  },
});
