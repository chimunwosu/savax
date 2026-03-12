import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';

import DashboardScreen from '../screens/DashboardScreen';
import IncomeScreen from '../screens/IncomeScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import GoalsScreen from '../screens/GoalsScreen';
import MoreScreen from '../screens/MoreScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.navy },
          headerTintColor: colors.gold,
          headerTitleStyle: { fontWeight: '700' },
          tabBarActiveTintColor: colors.gold,
          tabBarInactiveTintColor: colors.gray400,
          tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.gray100 },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'Savax', tabBarLabel: 'Home' }}
        />
        <Tab.Screen
          name="Income"
          component={IncomeScreen}
          options={{ tabBarLabel: 'Income' }}
        />
        <Tab.Screen
          name="Expenses"
          component={ExpensesScreen}
          options={{ tabBarLabel: 'Expenses' }}
        />
        <Tab.Screen
          name="Goals"
          component={GoalsScreen}
          options={{ title: 'Savings Goals', tabBarLabel: 'Goals' }}
        />
        <Tab.Screen
          name="More"
          component={MoreScreen}
          options={{ tabBarLabel: 'More' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
