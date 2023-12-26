"use server";

import { addReviewToRestaurant } from "@/src/lib/firebase/firestore";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/firebase";
import { getFirestore } from "firebase/firestore";

export async function handleReviewFormSubmission(data: FormData) {
  const { app } = await getAuthenticatedAppForUser();
  if (!app || !data) return;
  const db = getFirestore(app);

  await addReviewToRestaurant(db, data.get("restaurantId") as string, {
    text: data.get("text") as string,
    rating: data.get("rating") as string,

    // This came from a hidden form field
    userId: data.get("userId") as string,
  });
}
