import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  useOwnerReviews,
  useOwnerAverageRating,
  useCreateReview,
  useUserCanReview,
} from "@/hooks/useReviews";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ReviewSectionProps {
  ownerId: string;
  ownerName: string;
  propertyId?: string;
}

function StarRating({
  rating,
  onRatingChange,
  interactive = false,
  size = "md",
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= (hoverRating || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ ownerId, ownerName, propertyId }: ReviewSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { data: reviews, isLoading } = useOwnerReviews(ownerId);
  const { data: averageRating } = useOwnerAverageRating(ownerId);
  const { data: canReview } = useUserCanReview(ownerId, user?.id);
  const createReview = useCreateReview();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview.mutateAsync({
        ownerId,
        propertyId,
        rating,
        comment: comment.trim() || undefined,
      });
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      setIsDialogOpen(false);
      setRating(0);
      setComment("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Average Rating */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Reviews</h3>
          {averageRating && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={Math.round(averageRating.average)} size="sm" />
              <span className="text-sm text-muted-foreground">
                {averageRating.average} ({averageRating.count} review
                {averageRating.count !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>

        {isAuthenticated && canReview && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Write a Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Review {ownerName}</DialogTitle>
                <DialogDescription>
                  Share your experience with this property owner
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  <StarRating
                    rating={rating}
                    onRatingChange={setRating}
                    interactive
                    size="lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Comment (optional)
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || rating === 0}
                  className="w-full gradient-primary border-0"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 rounded-lg bg-secondary/50 border border-border"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {(review.reviewer_profile?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">
                      {review.reviewer_profile?.name || "Anonymous"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>
              {review.comment && (
                <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No reviews yet</p>
        </div>
      )}
    </div>
  );
}
