import { useNavigation, useRoute } from "@react-navigation/native";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import React from "react";
import { Alert, Button, ScrollView, Text, TextInput, View } from "react-native";
import { auth, db } from "../lib/firebase";

type SetRow = { reps: string; weight: string };
type ExerciseRow = { name: string; bodyPart: string; sets: SetRow[] };

function todayKey(d = new Date()) {
  const x = new Date(d);
  x.setHours(0,0,0,0);
  return x.toISOString().slice(0,10);
}

export default function WorkoutEditor() {
  const route = useRoute<any>();           // route.params?.workoutId (optional)
  const navigation = useNavigation<any>();
  const uid = auth.currentUser?.uid;

  const [dateKey, setDateKey] = React.useState(todayKey());
  const [notes, setNotes] = React.useState("");
  const [items, setItems] = React.useState<ExerciseRow[]>([
    { name: "Bench Press", bodyPart: "Chest", sets: [{ reps: "8", weight: "60" }] },
  ]);
  const [loading, setLoading] = React.useState(false);

  const workoutId: string | undefined = route.params?.workoutId;

  // Load existing workout if editing
  React.useEffect(() => {
    (async () => {
      if (!uid || !workoutId) return;
      setLoading(true);
      try {
        const ref = doc(db, "users", uid, "workouts", workoutId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const w: any = snap.data();
          setDateKey(w.dateKey ?? todayKey());
          setNotes(w.notes ?? "");
          setItems(
            (w.items ?? []).map((it: any) => ({
              name: it.name || "",
              bodyPart: it.bodyPart || "",
              sets: (it.sets ?? []).map((s: any) => ({
                reps: String(s.reps ?? ""),
                weight: String(s.weight ?? "")
              }))
            }))
          );
        }
      } finally { setLoading(false); }
    })();
  }, [uid, workoutId]);

  // Helpers to mutate arrays
  const addExercise = () => setItems(prev => [...prev, { name: "", bodyPart: "", sets: [{ reps: "", weight: "" }] }]);
  const removeExercise = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateExercise = (i: number, patch: Partial<ExerciseRow>) =>
    setItems(prev => prev.map((ex, idx) => idx === i ? { ...ex, ...patch } : ex));
  const addSet = (ei: number) =>
    setItems(prev => prev.map((ex, idx) => idx === ei ? { ...ex, sets: [...ex.sets, { reps: "", weight: "" }] } : ex));
  const removeSet = (ei: number, si: number) =>
    setItems(prev => prev.map((ex, idx) => idx === ei ? { ...ex, sets: ex.sets.filter((_, k) => k !== si) } : ex));
  const updateSet = (ei: number, si: number, patch: Partial<SetRow>) =>
    setItems(prev => prev.map((ex, idx) => {
      if (idx !== ei) return ex;
      return { ...ex, sets: ex.sets.map((s, k) => k === si ? { ...s, ...patch } : s) };
    }));

  const shiftDay = (delta: number) => {
    const [y,m,d] = dateKey.split("-").map(Number);
    const nd = new Date(y, (m-1), d);
    nd.setDate(nd.getDate() + delta);
    setDateKey(todayKey(nd));
  };

  const sanitize = () => {
    // remove empty exercises/sets
    const pruned = items
      .map(ex => ({
        name: ex.name.trim(),
        bodyPart: ex.bodyPart.trim(),
        sets: ex.sets
          .map(s => ({ reps: Number(s.reps), weight: Number(s.weight) }))
          .filter(s => Number.isFinite(s.reps) && Number.isFinite(s.weight))
      }))
      .filter(ex => ex.name && ex.sets.length > 0);
    return pruned;
  };

  const save = async () => {
    if (!uid) return Alert.alert("Not signed in");
    const clean = sanitize();
    if (!dateKey) return Alert.alert("Pick a date");
    if (clean.length === 0) return Alert.alert("Add at least one exercise with a valid set");

    try {
      setLoading(true);
      if (workoutId) {
        const ref = doc(db, "users", uid, "workouts", workoutId);
        await setDoc(ref, { dateKey, notes, items: clean }, { merge: true });
      } else {
        const coll = collection(db, "users", uid, "workouts");
        await addDoc(coll, {
          dateKey,
          notes,
          items: clean,
          startAt: serverTimestamp()
        });
      }
      Alert.alert("Saved ✅");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex:1 }} contentContainerStyle={{ padding:16, gap:12 }}>
      <Text style={{ fontSize:22, fontWeight:"700" }}>{workoutId ? "Edit Workout" : "New Workout"}</Text>

      {/* Date row */}
      <View style={{ flexDirection:"row", alignItems:"center", gap:8 }}>
        <Button title="◀︎" onPress={() => shiftDay(-1)} />
        <Text style={{ fontSize:16, fontWeight:"600" }}>{dateKey}</Text>
        <Button title="▶︎" onPress={() => shiftDay(1)} />
      </View>

      {/* Notes */}
      <Text>Notes</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Optional notes…"
        style={{ borderWidth:1, padding:10, borderRadius:8 }}
      />

      {/* Exercises */}
      <View style={{ gap:12 }}>
        {items.map((ex, i) => (
          <View key={i} style={{ borderWidth:1, borderRadius:8, padding:12, gap:8 }}>
            <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center" }}>
              <Text style={{ fontWeight:"700" }}>Exercise {i+1}</Text>
              <Button title="Remove" onPress={() => removeExercise(i)} />
            </View>

            <Text>Exercise name</Text>
            <TextInput
              value={ex.name}
              onChangeText={(t) => updateExercise(i, { name: t })}
              placeholder="e.g. Bench Press"
              style={{ borderWidth:1, padding:10, borderRadius:8 }}
            />

            <Text>Body part</Text>
            <TextInput
              value={ex.bodyPart}
              onChangeText={(t) => updateExercise(i, { bodyPart: t })}
              placeholder="e.g. Chest"
              style={{ borderWidth:1, padding:10, borderRadius:8 }}
            />

            {/* Sets */}
            <Text style={{ marginTop:4, fontWeight:"600" }}>Sets</Text>
            {ex.sets.map((s, si) => (
              <View key={si} style={{ flexDirection:"row", gap:8, alignItems:"center" }}>
                <TextInput
                  value={s.reps}
                  onChangeText={(t) => updateSet(i, si, { reps: t })}
                  keyboardType="numeric"
                  placeholder="Reps"
                  style={{ flex:1, borderWidth:1, padding:10, borderRadius:8 }}
                />
                <TextInput
                  value={s.weight}
                  onChangeText={(t) => updateSet(i, si, { weight: t })}
                  keyboardType="numeric"
                  placeholder="Weight"
                  style={{ flex:1, borderWidth:1, padding:10, borderRadius:8 }}
                />
                <Button title="X" onPress={() => removeSet(i, si)} />
              </View>
            ))}
            <Button title="Add set" onPress={() => addSet(i)} />
          </View>
        ))}
        <Button title="Add exercise" onPress={addExercise} />
      </View>

      <Button title={loading ? "Saving…" : (workoutId ? "Update Workout" : "Save Workout")} onPress={save} />
    </ScrollView>
  );
}
