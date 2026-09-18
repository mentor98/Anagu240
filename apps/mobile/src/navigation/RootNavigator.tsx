import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuthStore } from '../services/auth-store';

// Screens
import { LoginScreen }          from '../screens/LoginScreen';
import { DashboardScreen }      from '../screens/DashboardScreen';
import { NewApplicationScreen } from '../screens/NewApplicationScreen';
import { ApplicationDetailScreen } from '../screens/ApplicationDetailScreen';
import { TitleDetailScreen }    from '../screens/TitleDetailScreen';
import { ProfileScreen }        from '../screens/ProfileScreen';

export type RootStackParamList = {
  Login:              undefined;
  Main:               undefined;
  ApplicationDetail:  { applicationId: string };
  TitleDetail:        { tokenId: string };
  NewApplication:     undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Apply:     undefined;
  Profile:   undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor:   '#1B4F72',
        tabBarInactiveTintColor: '#9CA3AF',
        headerStyle: { backgroundColor: '#1B4F72' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'My Applications',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Apply"
        component={NewApplicationScreen}
        options={{
          title: 'New Application',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>➕</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'My Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="ApplicationDetail"
            component={ApplicationDetailScreen}
            options={{ headerShown: true, title: 'Application', headerStyle: { backgroundColor: '#1B4F72' }, headerTintColor: '#fff' }}
          />
          <Stack.Screen
            name="TitleDetail"
            component={TitleDetailScreen}
            options={{ headerShown: true, title: 'Land Title NFT', headerStyle: { backgroundColor: '#1B4F72' }, headerTintColor: '#fff' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
