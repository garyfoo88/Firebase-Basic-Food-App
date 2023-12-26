// This component handles the list of reviews for a given restaurant

import React from "react";
import renderStars from "@/src/components/Stars";

type ReviewsListProps = {
  reviews: any;
  userId: string;
};

const ReviewsList = ({ reviews, userId }: ReviewsListProps) => {
  return (
    <article>
      <ul className="reviews">
        {reviews.length > 0 ? (
          <ul>
            {reviews.map((review: any) => (
              <li key={review.id} className="review__item">
                <ul className="restaurant__rating">
                  {renderStars(review.rating)}
                </ul>
                <p>{review.text}</p>

                <time>
                  {new Intl.DateTimeFormat("en-GB", {
                    dateStyle: "medium",
                  }).format(review.timestamp)}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            This restaurant has not been reviewed yet,{" "}
            {!userId ? "first login and then" : ""} add your own review!
          </p>
        )}
      </ul>
    </article>
  );
};

export default ReviewsList;
