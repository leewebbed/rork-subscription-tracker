import { Tabs } from "expo-router";
import { Users, UserPlus, FolderPlus, Shield } from "lucide-react-native";
import React from "react";

import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: true,
        headerStyle: {
          backgroundColor: '#2563EB',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700' as const,
        },
        tabBarStyle: {
          backgroundColor: Colors.light.surface,
          borderTopColor: Colors.light.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Clients",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-client"
        options={{
          title: "Add Client",
          tabBarIcon: ({ color }) => <UserPlus size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-category"
        options={{
          title: "Add Category",
          tabBarIcon: ({ color }) => <FolderPlus size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="privacy"
        options={{
          title: "Privacy",
          tabBarIcon: ({ color }) => <Shield size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
