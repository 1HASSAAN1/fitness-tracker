import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { auth, db } from "../lib/firebase";

export default function WorkoutEditor({ navigation }: any) {
  const [exercise, setExercise] = React.useState("Bench Press");
  const [reps, setReps] = React.useState("8");
  const [weight, setWeight] = React.useState("60");
  const [notes, setNotes] = React.useState("");

  const save = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return Alert.alert("Not signed in");
    try {
      await addDoc(collection(db, "users", uid, "workouts"), {
        createdAt: serverTimestamp(),
        date: new Date(),
        notes,
        items: [
          {
            exerciseId: exercise.toLowerCase().replace(/\s+/g, "_"),
            name: exercise,
            sets: [{ reps: Number(reps), weight: Number(weight) }],
          },
        ],
      });
      Alert.alert("Saved!");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <View style={{ flex:1, padding:16, gap:12 }}>
      <Text style={{ fontSize:22, fontWeight:"700" }}>New Workout</Text>
      <Text>Exercise</Text>
      <TextInput value={exercise} onChangeText={setExercise} style={{ borderWidth:1, padding:10, borderRadius:8 }} />
      <Text>Reps</Text>
      <TextInput value={reps} onChangeText={setReps} keyboardType="numeric" style={{ borderWidth:1, padding:10, borderRadius:8 }} />
      <Text>Weight (kg)</Text>
      <TextInput value={weight} onChangeText={setWeight} keyboardType="numeric" style={{ borderWidth:1, padding:10, borderRadius:8 }} />
      <Text>Notes</Text>
      <TextInput value={notes} onChangeText={setNotes} style={{ borderWidth:1, padding:10, borderRadius:8 }} />
      <Button title="Save Workout" onPress={save} />
    </View>
  );
}
