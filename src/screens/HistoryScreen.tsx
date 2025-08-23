import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../lib/firebase";

export default function HistoryScreen() {
  const [items, setItems] = React.useState<any[]>([]);
  const uid = auth.currentUser?.uid;

  React.useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, "users", uid, "workouts"),
      orderBy("date", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [uid]);

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:22, fontWeight:"700", marginBottom:8 }}>History</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ paddingVertical:12, borderBottomWidth:1, borderColor:"#eee" }}>
            <Text style={{ fontWeight:"600" }}>
              {new Date(item.date?.seconds ? item.date.seconds * 1000 : item.date).toDateString()}
            </Text>
            <Text>{item.items?.[0]?.name} • {item.items?.[0]?.sets?.[0]?.reps} x {item.items?.[0]?.sets?.[0]?.weight} kg</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No workouts yet. Add one!</Text>}
      />
    </View>
  );
}
