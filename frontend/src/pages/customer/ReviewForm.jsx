import { useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ReviewForm({ requestId, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const { show } = useToast();

  const submit = async () => {
    try {
      await api.post('/reviews', { request_id: requestId, rating, comment });
      show('Review submitted', 'success');
      onDone?.();
    } catch (err) { show(err.response?.data?.error || 'Failed', 'error'); }
  };

  return (
    <div className="card">
      <h3>Leave a review</h3>
      <div className="stars">
        {[1,2,3,4,5].map((n) => (
          <span key={n} className={n <= rating ? 'star filled' : 'star'} onClick={() => setRating(n)}>★</span>
        ))}
      </div>
      <textarea placeholder="How was the service?" value={comment} onChange={(e) => setComment(e.target.value)} />
      <button className="btn btn-primary" onClick={submit}>Submit Review</button>
    </div>
  );
}