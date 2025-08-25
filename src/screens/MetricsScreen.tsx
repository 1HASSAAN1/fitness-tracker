// src/screens/MetricsScreen.tsx
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import React from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { auth, db } from "../lib/firebase";

function dateKeyFor(d: Date) {
  // Normalize to start of local day, then ISO date
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().slice(0, 10); // YYYY-MM-DD
}

export default function MetricsScreen() {
  const [date, setDate] = React.useState<Date>(new Date());
  const [weight, setWeight] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  const uid = auth.currentUser?.uid;
  const key = dateKeyFor(date);

  const load = React.useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const ref = doc(db, "users", uid, "metricsDaily", key);
      const snap = await getDoc(ref);
      const w = snap.exists() ? snap.data()?.weightKg : "";
      setWeight(w ? String(w) : "");
    } finally {
      setLoading(false);
    }
  }, [uid, key]);

  React.useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!uid) return Alert.alert("Not signed in");
    const w = parseFloat(weight);
    if (Number.isNaN(w) || w <= 0) return Alert.alert("Enter a valid weight");
    const ref = doc(db, "users", uid, "metricsDaily", key);
    await setDoc(ref, {
      dateKey: key,
      weightKg: w,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    Alert.alert("Saved ✅");
  };

  const shiftDay = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d);
  };

  return (
    <View style={{ flex:1, padding:16, gap:12 }}>
      <Text style={{ fontSize:22, fontWeight:"700" }}>Weight (per day)</Text>

      <View style={{ flexDirection:"row", gap:8, alignItems:"center" }}>
        <Button title="◀︎" onPress={() => shiftDay(-1)} />
        <Text style={{ fontSize:16, fontWeight:"600" }}>{key}</Text>
        <Button title="▶︎" onPress={() => shiftDay(1)} />
      </View>

      <Text>Weight (kg)</Text>
      <TextInput
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        placeholder="e.g. 76.4"
        style={{ borderWidth:1, padding:10, borderRadius:8 }}
        editable={!loading}
      />

      <Button title={loading ? "Loading…" : "Save"} onPress={save} />
      <Text style={{ opacity:0.7 }}>
        Each date has a single entry; saving again updates that day.
      </Text>
    </View>
  );
}
