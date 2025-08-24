import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged, User } from "firebase/auth";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { auth } from "../lib/firebase";
import HistoryScreen from "../screens/HistoryScreen";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import MetricsScreen from "../screens/MetricsScreen";
import ProgressScreen from "../screens/ProgressScreen";
import WorkoutEditor from "../screens/WorkoutEditor";


const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
    return unsub;
  }, []);

  if (loading) {
    return (
      <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {user ? (
    <>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="WorkoutEditor" component={WorkoutEditor} options={{ title: "New Workout" }} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Metrics" component={MetricsScreen} />
      <Stack.Screen name="Progress" component={ProgressScreen} />

    </>
  ) : (
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown:false }} />
  )}


    </Stack.Navigator>
  );
}



  