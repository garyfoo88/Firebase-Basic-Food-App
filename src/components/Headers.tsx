"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  onAuthStateChanged,
  signInWithGoogle,
  signOut,
} from "@/src/lib/firebase/auth";
import { addFakeRestaurantsAndReviews } from "@/src/lib/firebase/firestore";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";

function useUserSession(initialUser: User | null | undefined) {
  // The initialUser comes from the server via a server component
  const [user, setUser] = useState(initialUser);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((authUser) => {
      setUser(authUser);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onAuthStateChanged((authUser) => {
      console.log("authUser", authUser);
      if (user === undefined) return;

      // refresh when user changed to ease testing
      if (user?.email !== authUser?.email) {
        router.refresh();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return user;
}

export default function Header({
  initialUser,
}: Readonly<{ initialUser: User | null | undefined }>) {
  const user = useUserSession(initialUser);
  const handleSignOut = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    signOut();
  };

  const handleSignIn = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    signInWithGoogle();
  };

  return (
    <header>
      <Link href="/" className="logo">
        <img src="/friendly-eats.svg" alt="FriendlyEats" /> Friendly Eats
      </Link>
      {user ? (
        <div className="profile">
          <p>
            <img src="/profile.svg" alt={user?.email ?? "profile"} />
            {user.displayName}
          </p>

          <div className="menu">
            ...
            <ul>
              <li>{user.displayName}</li>

              <li>
                <button onClick={addFakeRestaurantsAndReviews}>
                  Add sample restaurants
                </button>
              </li>

              <li>
                <button onClick={handleSignOut}>Sign Out</button>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button onClick={handleSignIn}>Sign In with Google</button>
      )}
    </header>
  );
}
