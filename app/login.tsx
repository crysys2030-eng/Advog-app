import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Scale, Lock, Mail, User, Briefcase } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [oab, setOab] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Erro', 'Usuário não encontrado ou credenciais inválidas');
      }
    } catch {
      Alert.alert('Erro', 'Ocorreu um erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !oab || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(name, email, oab, password);
      if (result.success) {
        Alert.alert('Sucesso', result.message, [
          {
            text: 'OK',
            onPress: () => {
              setIsRegisterMode(false);
              setName('');
              setOab('');
            },
          },
        ]);
      } else {
        Alert.alert('Erro', result.message);
      }
    } catch {
      Alert.alert('Erro', 'Ocorreu um erro ao criar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setEmail('');
    setPassword('');
    setName('');
    setOab('');
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Scale size={48} color="#fff" />
            </View>
            <Text style={styles.title}>Advocacia Digital</Text>
            <Text style={styles.subtitle}>Sistema de Gestão Jurídica</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeButton, !isRegisterMode && styles.modeButtonActive]}
                onPress={() => !isRegisterMode || toggleMode()}
              >
                <Text style={[styles.modeButtonText, !isRegisterMode && styles.modeButtonTextActive]}>
                  Entrar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, isRegisterMode && styles.modeButtonActive]}
                onPress={() => isRegisterMode || toggleMode()}
              >
                <Text style={[styles.modeButtonText, isRegisterMode && styles.modeButtonTextActive]}>
                  Registrar
                </Text>
              </TouchableOpacity>
            </View>

            {isRegisterMode && (
              <>
                <View style={styles.inputContainer}>
                  <User size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    placeholderTextColor="#64748b"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Briefcase size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="OAB (ex: OAB/SP 123.456)"
                    placeholderTextColor="#64748b"
                    value={oab}
                    onChangeText={setOab}
                    autoCapitalize="characters"
                  />
                </View>
              </>
            )}

            <View style={styles.inputContainer}>
              <Mail size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={isRegisterMode ? "Senha (mínimo 6 caracteres)" : "Senha"}
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={isRegisterMode ? handleRegister : handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>
                  {isRegisterMode ? 'Criar Conta' : 'Entrar'}
                </Text>
              )}
            </TouchableOpacity>

            {!isRegisterMode && (
              <View style={styles.registerPrompt}>
                <Text style={styles.registerPromptText}>Não tem uma conta?</Text>
                <TouchableOpacity onPress={toggleMode}>
                  <Text style={styles.registerPromptLink}> Registre-se</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Sistema Profissional de Gestão
            </Text>
            <Text style={styles.footerSubtext}>
              Advocacia Administrativa
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: '#fff',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600' as const,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  modeButtonText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerPromptText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  registerPromptLink: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  footer: {
    marginTop: 48,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 4,
  },
  footerSubtext: {
    color: '#475569',
    fontSize: 12,
  },
});
