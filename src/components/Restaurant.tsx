"use client";

// This components shows one individual restaurant
// It receives data from src/app/restaurant/[id]/page.jsx

import { useState, useEffect } from "react";
import {
  getRestaurantSnapshotById,
  getReviewsSnapshotByRestaurantId,
} from "@/src/lib/firebase/firestore";
import { GetUser } from "@/src/lib/GetUser";
import { updateRestaurantImage } from "@/src/lib/firebase/storage";
import ReviewDialog from "@/src/components/ReviewDialog";
import RestaurantDetails from "@/src/components/RestaurantDetails";
import ReviewsList from "@/src/components/ReviewList";

export default function Restaurant({
  id,
  initialRestaurant,
  initialReviews,
  initialUserId,
}: any) {
  const [restaurant, setRestaurant] = useState(initialRestaurant);
  const [isOpen, setIsOpen] = useState(false);

  // The only reason this component needs to know the user ID is to associate a review with the user, and to know whether to show the review dialog
  const userId = GetUser()?.uid || initialUserId;
  const [review, setReview] = useState({
    rating: 0,
    text: "",
  });
  const [reviews, setReviews] = useState(initialReviews);

  const onChange = (value: string, name: string) => {
    setReview({ ...review, [name]: value });
  };

  async function handleRestaurantImage(target: any) {
    const image = target.files ? target.files[0] : null;
    if (!image) {
      return;
    }

    const imageURL = await updateRestaurantImage(id, image);
    setRestaurant({ ...restaurant, photo: imageURL });
  }

  const handleClose = () => {
    setIsOpen(false);
    setReview({ rating: 0, text: "" });
  };

  useEffect(() => {
    const unsubscribeFromRestaurant = getRestaurantSnapshotById(id, (data) => {
      setRestaurant(data);
    });

    const unsubscribeFromReviewsSnapshot = getReviewsSnapshotByRestaurantId(
      id,
      (data) => {
        setReviews(data);
      }
    );

    return () => {
      if (!unsubscribeFromRestaurant || !unsubscribeFromReviewsSnapshot) return;
      unsubscribeFromRestaurant();
      unsubscribeFromReviewsSnapshot();
    };
  }, []);

  return (
    <div>
      <RestaurantDetails
        restaurant={restaurant}
        userId={userId}
        handleRestaurantImage={handleRestaurantImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      />
      <ReviewDialog
        isOpen={isOpen}
        handleClose={handleClose}
        review={review}
        onChange={onChange}
        userId={userId}
        id={id}
      />
      <ReviewsList reviews={reviews} userId={userId} />
    </div>
  );
}
