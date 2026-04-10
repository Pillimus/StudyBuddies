import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CalendarScreen from '../screens/CalendarScreen';
import ChatsScreen from '../screens/ChatsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import FilesScreen from '../screens/FilesScreen';
import GroupsScreen from '../screens/GroupsScreen';

const Stack = createNativeStackNavigator();

export default function AuthenticatedTabs() {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Groups" component={GroupsScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="Chats" component={ChatsScreen} />
      <Stack.Screen name="Files" component={FilesScreen} />
    </Stack.Navigator>
  );
}
