import { useNavigation } from "@react-navigation/native";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../lib/firebase";

type WorkoutRow = {
  id: string;
  dateKey: string;
  notes?: string;
  items?: any[];
  startAt?: any;
};

export default function HistoryScreen() {
  const uid = auth.currentUser?.uid;
  const nav: any = useNavigation();
  const [items, setItems] = React.useState<WorkoutRow[]>([]);

  React.useEffect(() => {
    if (!uid) return;
    // Order newest first. If startAt missing (old entries), Firestore will still sort (nulls last).
    const q = query(collection(db, "users", uid, "workouts"), orderBy("startAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    });
    return unsub;
  }, [uid]);

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:22, fontWeight:"700", marginBottom:8 }}>History</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          const first = item.items?.[0];
          const summary = first ? `${first.name} • ${first.bodyPart} • ${first.sets?.[0]?.reps} x ${first.sets?.[0]?.weight}kg` : "—";
          return (
            <TouchableOpacity
              onPress={() => nav.navigate("WorkoutEditor", { workoutId: item.id })}
              style={{ paddingVertical:12, borderBottomWidth:1, borderColor:"#eee" }}
            >
              <Text style={{ fontWeight:"600" }}>{item.dateKey || "No date"}</Text>
              <Text numberOfLines={1} style={{ color:"#555" }}>{summary}</Text>
              {item.notes ? <Text numberOfLines={1} style={{ color:"#777" }}>{item.notes}</Text> : null}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text>No workouts yet. Tap “Start Workout”.</Text>}
      />
    </View>
  );
}
