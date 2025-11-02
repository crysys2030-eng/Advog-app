import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CaseProvider } from "@/contexts/CaseContext";
import { ClientProvider } from "@/contexts/ClientContext";
import { DocumentProvider } from "@/contexts/DocumentContext";
import { EventProvider } from "@/contexts/EventContext";
import { BillingProvider } from "@/contexts/BillingContext";
import { TaskProvider } from "@/contexts/TaskContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Voltar" }}>
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
    </QueryClientProvider>
  );
}
