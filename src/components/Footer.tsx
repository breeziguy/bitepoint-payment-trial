import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-white py-6 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-2">
          <svg 
            viewBox="0 0 24 24" 
            className="w-5 h-5"
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M3 3h18v18H3zM8 12h8M12 8v8" />
          </svg>
          <p className="text-sm text-gray-600">
            Powered by <Link to="/" className="font-semibold hover:text-gray-900">Bitepoint</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}