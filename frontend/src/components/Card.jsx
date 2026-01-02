// src/components/Card.jsx
import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate";

export default function Card({ plan, showButton = true }) {
  return (
    <div className="card">
      <h3 className="text-lg font-heading font-semibold text-brand-dark mb-2">
        {plan.title}
      </h3>
      <p className="text-gray-600 mb-2">{plan.description}</p>
      <p className="text-sm text-gray-500 mb-4">{formatDate(plan.datetime)}</p>

      {showButton && (
        <Link
          to={`/plan/${plan.id}`}
          className="btn"
        >
          View Details
        </Link>
      )}
    </div>
  );
}
