// This components handles the review dialog and uses a next.js feature known as Server Actions to handle the form submission

import React from "react";
import RatingPicker from "@/src/components/RatingPicker";
import { handleReviewFormSubmission } from "@/src/app/actions";

type ReviewDialogProps = {
  isOpen: boolean;
  handleClose: () => void;
  review: any;
  onChange: (value: string, name: string) => void;
  userId: string;
  id: string;
};

const ReviewDialog = ({
  isOpen,
  handleClose,
  review,
  onChange,
  userId,
  id,
}: ReviewDialogProps) => {
  return (
    <dialog open={isOpen}>
      <div className="box">
        <form
          action={async (formData: FormData) => {
            await handleReviewFormSubmission(formData);
          }}
          onSubmit={() => {
            handleClose();
          }}
        >
          <header>
            <h3>Add your review</h3>
          </header>
          <article>
            <RatingPicker />
            <p>
              <input
                type="text"
                name="text"
                id="review"
                placeholder="Write your thoughts here"
                required
                value={review.text}
                onChange={(e) => onChange(e.target.value, "text")}
              />
            </p>

            <input type="hidden" name="restaurantId" value={id} />
            <input type="hidden" name="userId" value={userId} />
          </article>
          <footer>
            <menu>
              <button
                autoFocus
                type="reset"
                onClick={handleClose}
                className="button--cancel"
              >
                Cancel
              </button>
              <button type="submit" value="confirm" className="button--confirm">
                Submit
              </button>
            </menu>
          </footer>
        </form>
      </div>
    </dialog>
  );
};

export default ReviewDialog;
