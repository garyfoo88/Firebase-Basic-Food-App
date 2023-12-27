import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  NextOrObserver,
  User,
} from "firebase/auth";

import { auth } from "@/src/lib/firebase/firebase";
import { setCookie, deleteCookie } from "cookies-next";

export function onAuthStateChanged(cb: NextOrObserver<User>) {
  return _onAuthStateChanged(auth, cb);
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    const userCreds = await signInWithPopup(auth, provider);
    const idToken = await userCreds.user.getIdToken();
    return setCookie("__session", idToken);
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
}

export async function signOut() {
  try {
    await auth.signOut();
    return deleteCookie("__session");
  } catch (error) {
    console.error("Error signing out with Google", error);
  }
}
