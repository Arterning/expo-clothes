import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import WardrobeScreen from '../screens/WardrobeScreen';
import OutfitsScreen from '../screens/OutfitsScreen';
import OccasionsScreen from '../screens/OccasionsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AddClothingScreen from '../screens/AddClothingScreen';
import EditClothingScreen from '../screens/EditClothingScreen';
import ClothingDetailScreen from '../screens/ClothingDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const WardrobeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="WardrobeList" component={WardrobeScreen} options={{ title: '我的衣橱' }} />
      <Stack.Screen name="AddClothing" component={AddClothingScreen} options={{ title: '添加衣物' }} />
      <Stack.Screen name="EditClothing" component={EditClothingScreen} options={{ title: '编辑衣物' }} />
      <Stack.Screen name="ClothingDetail" component={ClothingDetailScreen} options={{ title: '衣物详情' }} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Wardrobe"
        component={WardrobeStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="hanger" size={size} color={color} />
          ),
          title: '衣橱',
        }}
      />
      <Tab.Screen
        name="Outfits"
        component={OutfitsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="tshirt-crew" size={size} color={color} />
          ),
          title: '搭配'
        }}
      />
      <Tab.Screen
        name="Occasions"
        component={OccasionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="tag" size={size} color={color} />
          ),
          title: '场景'
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" size={size} color={color} />
          ),
          title: '日记'
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;