import React from 'react';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeColorTheme = colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: activeColorTheme.textMuted,
        tabBarStyle: {
          backgroundColor: activeColorTheme.card,
          borderTopWidth: 1,
          borderTopColor: activeColorTheme.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: activeColorTheme.background,
          borderBottomWidth: 1,
          borderBottomColor: activeColorTheme.border,
        },
        headerTitleStyle: {
          color: activeColorTheme.text,
          fontWeight: '700',
        },
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="subjects"
        options={{
          title: 'Subjects',
          tabBarLabel: 'Subjects',
          tabBarIcon: ({ color, size }) => (
            <Feather name="book-open" size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: 'Assignments',
          tabBarLabel: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <Feather name="check-square" size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Study Groups',
          tabBarLabel: 'Groups',
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size || 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
