import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CaseProvider } from "@/contexts/CaseContext";
import { ClientProvider } from "@/contexts/ClientContext";
import { DocumentProvider } from "@/contexts/DocumentContext";
import { EventProvider } from "@/contexts/EventContext";
import { BillingProvider } from "@/contexts/BillingContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Voltar" }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CaseProvider>
          <ClientProvider>
            <DocumentProvider>
              <EventProvider>
                <BillingProvider>
                  <TaskProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                      <RootLayoutNav />
                    </GestureHandlerRootView>
                  </TaskProvider>
                </BillingProvider>
              </EventProvider>
            </DocumentProvider>
          </ClientProvider>
        </CaseProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
