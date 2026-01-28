import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { colors } from './src/config/theme';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import DogsScreen from './src/screens/DogsScreen';
import WalksScreen from './src/screens/WalksScreen';
import TrainingsScreen from './src/screens/TrainingsScreen';
import AddDogScreen from './src/screens/AddDogScreen';
import AddWalkScreen from './src/screens/AddWalkScreen';
import AddTrainingScreen from './src/screens/AddTrainingScreen';
import DogDetailScreen from './src/screens/DogDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Dogs') {
            iconName = focused ? 'paw' : 'paw-outline';
          } else if (route.name === 'Walks') {
            iconName = focused ? 'walk' : 'walk-outline';
          } else if (route.name === 'Trainings') {
            iconName = focused ? 'school' : 'school-outline';
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: 'Início' }}
      />
      <Tab.Screen 
        name="Dogs" 
        component={DogsScreen}
        options={{ tabBarLabel: 'Cães' }}
      />
      <Tab.Screen 
        name="Walks" 
        component={WalksScreen}
        options={{ tabBarLabel: 'Passeios' }}
      />
      <Tab.Screen 
        name="Trainings" 
        component={TrainingsScreen}
        options={{ tabBarLabel: 'Adestrar' }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {signed ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="AddDog" component={AddDogScreen} />
          <Stack.Screen name="AddWalk" component={AddWalkScreen} />
          <Stack.Screen name="AddTraining" component={AddTrainingScreen} />
          <Stack.Screen name="DogDetail" component={DogDetailScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}

