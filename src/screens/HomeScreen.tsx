// src/screens/HomeScreen.tsx
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import React from "react";
import { Button, Text, View } from "react-native";
import { auth } from "../lib/firebase";

export default function HomeScreen() {
  const nav: any = useNavigation();
  return (
    <View style={{ flex:1, padding:16, gap:12, justifyContent:"center" }}>
      <Text style={{ fontSize:24, fontWeight:"700", textAlign:"center" }}>Fitness Tracker</Text>
      <Button title="Start Workout" onPress={() => nav.navigate("WorkoutEditor")} />
        <Button title="Duplicate Last → Today" onPress={() => nav.navigate("WorkoutEditor", { templateFrom: "last" })} />
      <Button title="History" onPress={() => nav.navigate("History")} />
      <Button title="Sign Out" color="#c00" onPress={() => signOut(auth)} />
        // src/screens/HomeScreen.tsx
      <Button title="Log Weight" onPress={() => nav.navigate("Metrics")} />
      <Button title="Progress" onPress={() => nav.navigate("Progress")} />

</View>
  );
}
