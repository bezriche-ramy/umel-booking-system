import { reviewsList } from "@/lib/siteData";

export default function TestimonialsTrack() {
    return (
        <div className="testimonials-editorial">
            {reviewsList.map((review, index) => (
                <blockquote key={`${review.name}-${index}`} className="testimonial-quote">
                    <span className="testimonial-index">{String(index + 1).padStart(2, "0")}</span>
                    <p>“{review.text}”</p>
                    <footer><cite>{review.name}</cite><span>★★★★★ · {review.role}</span></footer>
                </blockquote>
            ))}
        </div>
    );
}
