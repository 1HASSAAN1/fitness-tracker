import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { auth, db } from "../lib/firebase";

export default function MetricsScreen() {
  const [weight, setWeight] = React.useState("");

  const save = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return Alert.alert("Not signed in");
    const w = parseFloat(weight);
    if (Number.isNaN(w) || w <= 0) return Alert.alert("Enter a valid weight");
    await addDoc(collection(db, "users", uid, "metrics"), {
      date: serverTimestamp(),
      weightKg: w,
    });
    setWeight("");
    Alert.alert("Saved ✅");
  };

  return (
    <View style={{ flex:1, padding:16, gap:12 }}>
      <Text style={{ fontSize:22, fontWeight:"700" }}>Metrics</Text>
      <Text>Weight (kg)</Text>
      <TextInput
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        placeholder="e.g. 76.4"
        style={{ borderWidth:1, padding:10, borderRadius:8 }}
      />
      <Button title="Save" onPress={save} />
      <Text style={{ opacity:0.7, marginTop:8 }}>
        Tip: add 3–5 entries this week to see a nice trend.
      </Text>
    </View>
  );
}
