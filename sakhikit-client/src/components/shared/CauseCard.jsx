import { useNavigate } from 'react-router-dom';

export default function CauseCard({ cause }) {
  const navigate = useNavigate();
  const percent = cause.percentFunded || 0;

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-sakhi-100 overflow-hidden hover:shadow-md transition cursor-pointer"
      onClick={() => navigate(`/causes/${cause._id}`)}
    >
      {cause.coverImage ? (
        <img src={cause.coverImage} alt={cause.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-sakhi-100 flex items-center justify-center">
          <span className="text-4xl">🩸</span>
        </div>
      )}

      <div className="p-5">
        <span className="text-xs bg-sakhi-50 text-sakhi-700 px-2 py-1 rounded-full font-medium">
          {cause.beneficiaryType?.replace('_', ' ')}
        </span>

        <h3 className="font-bold text-sakhi-900 mt-2 mb-1 line-clamp-2">{cause.title}</h3>

        {cause.ngoId?.name && (
          <p className="text-xs text-gray-500 mb-3">by {cause.ngoId.name}</p>
        )}

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{cause.kitsFunded}/{cause.kitsNeeded} kits</span>
            <span>{percent}%</span>
          </div>
          <div className="w-full bg-sakhi-100 rounded-full h-2">
            <div
              className="bg-sakhi-500 h-2 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-sakhi-700">
            ₹{cause.costPerKit}/kit
          </p>
          <p className="text-xs text-gray-400">
            {new Date(cause.deadline).toLocaleDateString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );
}
