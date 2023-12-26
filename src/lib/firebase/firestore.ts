import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants";

import {
  collection,
  onSnapshot,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  Timestamp,
  runTransaction,
  where,
  addDoc,
  Transaction,
  DocumentReference,
  Firestore,
  Query,
} from "firebase/firestore";

import { db } from "@/src/lib/firebase/firebase";
import { RestaurantFilter } from "../types";

export async function updateRestaurantImageReference(
  restaurantId: string,
  publicImageUrl: string
) {
  const restaurantRef = doc(collection(db, "restaurants"), restaurantId);
  if (restaurantRef) {
    await updateDoc(restaurantRef, { photo: publicImageUrl });
  }
}

const updateWithRating = async (
  transaction: Transaction,
  docRef: DocumentReference,
  newRatingDocument: DocumentReference,
  review: { rating: string }
) => {
  const restaurant = await transaction.get(docRef);
  const data = restaurant.data();
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);
  const newAverage = newSumRating / newNumRatings;

  transaction.update(docRef, {
    numRatings: newNumRatings,
    sumRating: newSumRating,
    avgRating: newAverage,
  });

  transaction.set(newRatingDocument, {
    ...review,
    timestamp: Timestamp.fromDate(new Date()),
  });
};

export async function addReviewToRestaurant(
  db: Firestore,
  restaurantId: string,
  review: { rating: string; text: string; userId: string }
) {
  if (!restaurantId) {
    throw new Error("No restaurant ID has been provided.");
  }

  if (!review) {
    throw new Error("A valid review has not been provided.");
  }

  try {
    const docRef = doc(collection(db, "restaurants"), restaurantId);
    const newRatingDocument = doc(
      collection(db, `restaurants/${restaurantId}/ratings`)
    );

    // corrected line
    await runTransaction(db, (transaction) =>
      updateWithRating(transaction, docRef, newRatingDocument, review)
    );
  } catch (error) {
    console.error(
      "There was an error adding the rating to the restaurant",
      error
    );
    throw error;
  }
}

function applyQueryFilters(
  q: Query,
  {
    category,
    city,
    price,
    sort,
  }: {
    category: string;
    city: string;
    price: string;
    sort: string;
  }
) {
  if (category) {
    q = query(q, where("category", "==", category));
  }
  if (city) {
    q = query(q, where("city", "==", city));
  }
  if (price) {
    q = query(q, where("price", "==", price.length));
  }
  if (sort === "Rating" || !sort) {
    q = query(q, orderBy("avgRating", "desc"));
  } else if (sort === "Review") {
    q = query(q, orderBy("numRatings", "desc"));
  }
  return q;
}

export async function getRestaurants(
  filters: RestaurantFilter
): Promise<{ timestamp: any; id: string }[]> {
  let q = query(collection(db, "restaurants"));

  q = applyQueryFilters(q, filters);
  const results = await getDocs(q);
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

export function getRestaurantsSnapshot(
  callback: (
    data: {
      timestamp: number;
      id: string;
    }[]
  ) => void,
  filters: {
    category: string;
    city: string;
    price: string;
    sort: string;
  }
) {
  if (typeof callback !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  let q = query(collection(db, "restaurants"));
  q = applyQueryFilters(q, filters);

  // onSnapshot is a method used to listen for real-time updates to a query.
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(),
      };
    });

    callback(results);
  });

  return unsubscribe;
}

export async function getRestaurantById(restaurantId: string) {
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId);
    return;
  }
  const docRef = doc(db, "restaurants", restaurantId);
  const docSnap = await getDoc(docRef);
  return {
    ...docSnap.data(),
    timestamp: docSnap?.data()?.timestamp.toDate(),
  };
}

export function getRestaurantSnapshotById(
  restaurantId: string,
  cb: (data: any) => void
) {
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId);
    return;
  }

  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  const docRef = doc(db, "restaurants", restaurantId);
  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    cb({
      ...docSnap.data(),
      timestamp: docSnap?.data()?.timestamp.toDate(),
    });
  });
  return unsubscribe;
}

export async function getReviewsByRestaurantId(restaurantId: string) {
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );

  const results = await getDocs(q);
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

export function getReviewsSnapshotByRestaurantId(
  restaurantId: string,
  cb: (
    data: {
      timestamp: number;
      id: string;
    }[]
  ) => void
) {
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(),
      };
    });
    cb(results);
  });
  return unsubscribe;
}

export async function addFakeRestaurantsAndReviews() {
  const data = await generateFakeRestaurantsAndReviews();
  for (const { restaurantData, ratingsData } of data) {
    try {
      const docRef = await addDoc(
        collection(db, "restaurants"),
        restaurantData
      );

      for (const ratingData of ratingsData) {
        await addDoc(
          collection(db, "restaurants", docRef.id, "ratings"),
          ratingData
        );
      }
    } catch (e) {
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
