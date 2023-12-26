import Restaurant from "@/src/components/Restaurant";
import {
  getRestaurantById,
  getReviewsByRestaurantId,
} from "@/src/lib/firebase/firestore";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/firebase";

export const dynamic = "force-dynamic";

export default async function Home({ params }: any) {
  // This is a server component, we can access URL
  // parameters via Next.js and download the data
  // we need for this page
  const restaurant = await getRestaurantById(params.id);
  const reviews = await getReviewsByRestaurantId(params.id);
  const { currentUser } = await getAuthenticatedAppForUser();

  return (
    <main className="main__restaurant">
      <Restaurant
        id={params.id}
        initialRestaurant={restaurant}
        initialReviews={reviews}
        initialUserId={currentUser?.uid || ""}
      />
    </main>
  );
}
