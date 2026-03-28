import React, { useState, useEffect } from 'react';
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
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

  const validateName = (name: string): string | null => {
    if (!name.trim()) return 'Nome é obrigatório';
    if (name.trim().length < 3) return 'Nome deve ter pelo menos 3 caracteres';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) return 'Nome deve conter apenas letras';
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return 'Email é obrigatório';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email inválido';
    return null;
  };

  const validateOAB = (oab: string): string | null => {
    if (!oab.trim()) return 'OAB é obrigatória';
    const oabRegex = /^OAB\/[A-Z]{2}\s?\d{3,6}$/i;
    if (!oabRegex.test(oab)) return 'Formato inválido (ex: OAB/SP 123456)';
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Senha é obrigatória';
    if (password.length < 8) return 'Senha deve ter pelo menos 8 caracteres';
    if (!/[A-Z]/.test(password)) return 'Senha deve conter pelo menos uma letra maiúscula';
    if (!/[a-z]/.test(password)) return 'Senha deve conter pelo menos uma letra minúscula';
    if (!/[0-9]/.test(password)) return 'Senha deve conter pelo menos um número';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Senha deve conter pelo menos um caractere especial';
    return null;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return 'Confirme sua senha';
    if (password !== confirmPassword) return 'Senhas não coincidem';
    return null;
  };

  useEffect(() => {
    if (!isRegisterMode) {
      setErrors({});
    }
  }, [isRegisterMode]);

  const handleRegister = async () => {
    const newErrors: {[key: string]: string} = {};

    const nameError = validateName(name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const oabError = validateOAB(oab);
    if (oabError) newErrors.oab = oabError;

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Alert.alert('Erro de Validação', 'Por favor, corrija os erros no formulário');
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
              setEmail('');
              setPassword('');
              setOab('');
              setConfirmPassword('');
              setErrors({});
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
    setConfirmPassword('');
    setErrors({});
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
                <View>
                  <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                    <User size={20} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nome completo"
                      placeholderTextColor="#64748b"
                      value={name}
                      onChangeText={(text) => {
                        setName(text);
                        if (errors.name) {
                          const error = validateName(text);
                          setErrors(prev => ({ ...prev, name: error || '' }));
                        }
                      }}
                      autoCapitalize="words"
                    />
                  </View>
                  {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                <View>
                  <View style={[styles.inputContainer, errors.oab && styles.inputError]}>
                    <Briefcase size={20} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="OAB (ex: OAB/SP 123456)"
                      placeholderTextColor="#64748b"
                      value={oab}
                      onChangeText={(text) => {
                        setOab(text);
                        if (errors.oab) {
                          const error = validateOAB(text);
                          setErrors(prev => ({ ...prev, oab: error || '' }));
                        }
                      }}
                      autoCapitalize="characters"
                    />
                  </View>
                  {errors.oab && <Text style={styles.errorText}>{errors.oab}</Text>}
                </View>
              </>
            )}

            <View>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Mail size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      const error = validateEmail(text);
                      setErrors(prev => ({ ...prev, email: error || '' }));
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={isRegisterMode ? "Senha (mínimo 8 caracteres)" : "Senha"}
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      const error = validatePassword(text);
                      setErrors(prev => ({ ...prev, password: error || '' }));
                    }
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {isRegisterMode && (
              <View>
                <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                  <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar senha"
                    placeholderTextColor="#64748b"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) {
                        const error = validateConfirmPassword(password, text);
                        setErrors(prev => ({ ...prev, confirmPassword: error || '' }));
                      }
                    }}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>
            )}

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
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 16,
  },
});
