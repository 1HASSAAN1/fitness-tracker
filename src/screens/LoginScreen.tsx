import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { Button, Text, TextInput, View } from "react-native";
import { auth } from "../lib/firebase";

export default function LoginScreen() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const signin = async () => {
    setBusy(true); setErr(null);
    try { await signInWithEmailAndPassword(auth, email.trim(), password); }
    catch (e:any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const signup = async () => {
    setBusy(true); setErr(null);
    try { await createUserWithEmailAndPassword(auth, email.trim(), password); }
    catch (e:any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <View style={{ flex:1, padding:24, justifyContent:"center", gap:12 }}>
      <Text style={{ fontSize:28, fontWeight:"700", textAlign:"center" }}>Welcome</Text>
      <TextInput
        placeholder="Email" autoCapitalize="none" keyboardType="email-address"
        value={email} onChangeText={setEmail}
        style={{ borderWidth:1, padding:12, borderRadius:8 }}
      />
      <TextInput
        placeholder="Password" secureTextEntry
        value={password} onChangeText={setPassword}
        style={{ borderWidth:1, padding:12, borderRadius:8 }}
      />
      {err && <Text style={{ color:"red" }}>{err}</Text>}
      <Button title={busy ? "..." : "Sign In"} onPress={signin} />
      <Button title={busy ? "..." : "Create Account"} onPress={signup} />
    </View>
  );
}
