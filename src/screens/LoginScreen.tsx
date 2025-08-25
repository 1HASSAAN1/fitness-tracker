import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React from "react";
import { Button, Text, TextInput, View } from "react-native";
import { auth } from "../lib/firebase";

export default function LoginScreen() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const validate = () => {
    if (!email.includes("@")) return "Enter a valid email.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const signin = async () => {
    const v = validate(); if (v) return setError(v);
    setBusy(true); setError(null);
    try { await signInWithEmailAndPassword(auth, email.trim(), password); }
    catch (e: any) { setError(prettyFirebaseError(e)); }
    finally { setBusy(false); }
  };

  const signup = async () => {
    const v = validate(); if (v) return setError(v);
    setBusy(true); setError(null);
    try { await createUserWithEmailAndPassword(auth, email.trim(), password); }
    catch (e: any) { setError(prettyFirebaseError(e)); }
    finally { setBusy(false); }
  };

  return (
    <View style={{ flex:1, padding:24, justifyContent:"center", gap:12 }}>
      <Text style={{ fontSize:28, fontWeight:"700", textAlign:"center" }}>Welcome</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth:1, padding:12, borderRadius:8 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth:1, padding:12, borderRadius:8 }}
      />

      {error && <Text style={{ color:"red" }}>{error}</Text>}

      <Button title={busy ? "…" : "Sign In"} onPress={signin} />
      <Button title={busy ? "…" : "Create Account"} onPress={signup} />
      <Text style={{ opacity:0.7, marginTop:8, textAlign:"center" }}>
        By continuing you agree to the Terms & Privacy.
      </Text>
    </View>
  );
}

function prettyFirebaseError(e: any) {
  const msg = String(e?.code || e?.message || e);
  if (msg.includes("auth/invalid-email")) return "That email looks invalid.";
  if (msg.includes("auth/user-not-found")) return "No account for this email.";
  if (msg.includes("auth/wrong-password")) return "Wrong password.";
  if (msg.includes("auth/email-already-in-use")) return "Email already in use.";
  if (msg.includes("auth/weak-password")) return "Password too weak (min 6).";
  return "Something went wrong. Please try again.";
}

