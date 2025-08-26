// src/screens/HistoryScreen.tsx
import { useNavigation } from "@react-navigation/native";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import React from "react";
import {
  Alert,
  Button,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../lib/firebase";

type WorkoutRow = {
  id: string;
  dateKey?: string;
  notes?: string;
  items?: Array<{
    name?: string;
    bodyPart?: string;
    sets?: Array<{ reps?: number; weight?: number }>;
  }>;
  startAt?: any;
};

function todayKey(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10); // YYYY-MM-DD
}

export default function HistoryScreen() {
  const nav: any = useNavigation();
  const uid = auth.currentUser?.uid;
  const [rows, setRows] = React.useState<WorkoutRow[]>([]);

  // Load list (newest first)
  React.useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, "users", uid, "workouts"),
      orderBy("startAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return unsub;
  }, [uid]);

  const duplicateToToday = async (workoutId: string) => {
    if (!uid) return;
    try {
      const ref = doc(db, "users", uid, "workouts", workoutId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return Alert.alert("Not found");

      const w: any = snap.data();
      const payload = {
        dateKey: todayKey(),
        notes: w.notes ?? "",
        items: (w.items ?? []).map((it: any) => ({
          name: it.name || "",
          bodyPart: it.bodyPart || "",
          sets: (it.sets ?? []).map((s: any) => ({
            reps: Number(s.reps ?? 0),
            weight: Number(s.weight ?? 0),
          })),
        })),
        startAt: serverTimestamp(),
      };
      await addDoc(collection(db, "users", uid, "workouts"), payload);
      Alert.alert("Duplicated to today ✅");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    if (!uid) return;
    Alert.alert("Delete workout?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "users", uid, "workouts", workoutId));
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  const renderRow = ({ item }: { item: WorkoutRow }) => {
    const first = item.items?.[0];
    const set0 = first?.sets?.[0];
    const summary =
      first && set0
        ? `${first.name ?? "—"} • ${first.bodyPart ?? "—"} • ${set0.reps ?? "?"} x ${set0.weight ?? "?"}kg`
        : "—";

    return (
      <TouchableOpacity
        onPress={() => nav.navigate("WorkoutEditor", { workoutId: item.id })} // edit
        onLongPress={() => duplicateToToday(item.id)} // duplicate THIS workout to today
        style={{
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderColor: "#eee",
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600" }}>{item.dateKey || "No date"}</Text>
            <Text numberOfLines={1} style={{ color: "#555" }}>
              {summary}
            </Text>
            {item.notes ? (
              <Text numberOfLines={1} style={{ color: "#777" }}>
                {item.notes}
              </Text>
            ) : null}
          </View>

          {/* Quick actions */}
          <View style={{ gap: 6 }}>
            <Button
              title="Edit"
              onPress={() => nav.navigate("WorkoutEditor", { workoutId: item.id })}
            />
            <Button
              title="Duplicate"
              onPress={() => duplicateToToday(item.id)}
            />
            <Button
              title="Delete"
              color="#c00"
              onPress={() => deleteWorkout(item.id)}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 8 }}>History</Text>

      <FlatList
        data={rows}
        keyExtractor={(i) => i.id}
        renderItem={renderRow}
        ListEmptyComponent={<Text>No workouts yet. Tap “Start Workout”.</Text>}
      />
      <Text style={{ opacity: 0.6, marginTop: 8 }}>
        Tip: tap to edit • long-press to duplicate this workout into today.
      </Text>
    </View>
  );
}
