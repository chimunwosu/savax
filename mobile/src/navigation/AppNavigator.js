import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

import DashboardScreen from '../screens/DashboardScreen';
import IncomeScreen from '../screens/IncomeScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import GoalsScreen from '../screens/GoalsScreen';
import InvestmentsScreen from '../screens/InvestmentsScreen';
import DebtScreen from '../screens/DebtScreen';
import ReportsScreen from '../screens/ReportsScreen';
import AdvisorScreen from '../screens/AdvisorScreen';
import CalculatorScreen from '../screens/CalculatorScreen';
import NetWorthScreen from '../screens/NetWorthScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MoreScreen from '../screens/MoreScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.navy },
  headerTintColor: colors.gold,
  headerTitleStyle: { fontWeight: '700' },
};

const TAB_ICONS = {
  Dashboard: { focused: 'home', unfocused: 'home-outline' },
  Income: { focused: 'wallet', unfocused: 'wallet-outline' },
  Expenses: { focused: 'card', unfocused: 'card-outline' },
  Goals: { focused: 'flag', unfocused: 'flag-outline' },
  More: { focused: 'grid', unfocused: 'grid-outline' },
};

function MoreStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MoreHome" component={MoreScreen} options={{ title: 'More' }} />
      <Stack.Screen name="Investments" component={InvestmentsScreen} />
      <Stack.Screen name="DebtPayoff" component={DebtScreen} options={{ title: 'Debt Payoff' }} />
      <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Financial Reports' }} />
      <Stack.Screen name="Advisor" component={AdvisorScreen} options={{ title: 'Wealth Advisor' }} />
      <Stack.Screen name="Calculator" component={CalculatorScreen} options={{ title: 'Compound Calculator' }} />
      <Stack.Screen name="NetWorth" component={NetWorthScreen} options={{ title: 'Net Worth' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          ...screenOptions,
          tabBarActiveTintColor: colors.gold,
          tabBarInactiveTintColor: colors.gray400,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.gray100,
            height: 60,
            paddingBottom: 8,
            paddingTop: 4,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name] || TAB_ICONS.More;
            const iconName = focused ? icons.focused : icons.unfocused;
            return <Ionicons name={iconName} size={22} color={color} />;
          },
        })}
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
          component={MoreStack}
          options={{ headerShown: false, tabBarLabel: 'More' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
