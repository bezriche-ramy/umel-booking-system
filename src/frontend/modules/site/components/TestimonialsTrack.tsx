import { reviewsList, type Review } from "@shared/siteData";

function Testimonial({ review }: { review: Review }) {
    return (
        <blockquote className="testimonial-quote">
            <p>“{review.text}”</p>
            <footer><cite>{review.name}</cite><span>★★★★★ · {review.role}</span></footer>
        </blockquote>
    );
}

export default function TestimonialsTrack() {
    return (
        <>
            <div className="testimonials-editorial">
                {reviewsList.slice(0, 3).map((review, index) => <Testimonial key={`${review.name}-${index}`} review={review} />)}
            </div>
            {reviewsList.length > 3 && (
                <details className="testimonials-more">
                    <summary>Lire les {reviewsList.length - 3} autres témoignages</summary>
                    <div className="testimonials-editorial">
                        {reviewsList.slice(3).map((review, index) => <Testimonial key={`${review.name}-${index}`} review={review} />)}
                    </div>
                </details>
            )}
        </>
    );
}
