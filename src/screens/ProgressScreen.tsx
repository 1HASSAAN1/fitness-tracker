// src/screens/ProgressScreen.tsx
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React from "react";
import { Dimensions, ScrollView, Text } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { auth, db } from "../lib/firebase";

export default function ProgressScreen() {
  const [labels, setLabels] = React.useState<string[]>([]);
  const [data, setData] = React.useState<number[]>([]);
  const uid = auth.currentUser?.uid;

  React.useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, "users", uid, "metricsDaily"),
      orderBy("dateKey") // string sort works for YYYY-MM-DD
    );
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map(d => d.data() as any)
        .filter(r => typeof r.weightKg === "number");
      setLabels(rows.map(r => r.dateKey));
      setData(rows.map(r => r.weightKg));
    });
    return unsub;
  }, [uid]);

  const width = Dimensions.get("window").width - 32;

  return (
    <ScrollView style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:22, fontWeight:"700", marginBottom:12 }}>Progress</Text>
      {data.length >= 2 ? (
        <LineChart
          data={{ labels, datasets: [{ data }] }}
          width={width}
          height={220}
          yAxisSuffix=" kg"
          chartConfig={{
            backgroundColor: "#111",
            backgroundGradientFrom: "#111",
            backgroundGradientTo: "#111",
            decimalPlaces: 1,
            color: (o=1) => `rgba(255,255,255,${o})`,
            labelColor: (o=1) => `rgba(255,255,255,${o})`,
          }}
          style={{ borderRadius: 8 }}
        />
      ) : (
        <Text>Add weights for multiple days to see a chart.</Text>
      )}
    </ScrollView>
  );
}
