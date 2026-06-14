import { PiCheckBold, PiCircleBold } from "react-icons/pi";

const PasswordStrengthIndicator = ({ password = "" }) => {
  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-gray-300' };
    
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z\d]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' };
    if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
    if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-green-500' };
    return { score: 5, label: 'Very Strong', color: 'bg-emerald-600' };
  };

  const strength = getStrength(password);

  const criteria = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "At least 1 uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least 1 lowercase letter", met: /[a-z]/.test(password) },
    { label: "At least 1 number", met: /\d/.test(password) },
  ];

  return (
    <div className="mt-2 space-y-3">
      {/* Strength Bar */}
      {password && (
        <div>
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= strength.score ? strength.color : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs font-bold text-gray-500">
            Password Strength: <span className={`${strength.color.replace('bg-', 'text-')} font-extrabold`}>{strength.label}</span>
          </p>
        </div>
      )}

      {/* Criteria Checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-gray-100">
        {criteria.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[11px] sm:text-xs">
            {item.met ? (
              <PiCheckBold className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2]" />
            ) : (
              <PiCircleBold className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            )}
            <span className={`transition-colors font-bold ${item.met ? "text-emerald-600 font-extrabold" : "text-gray-400"}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
