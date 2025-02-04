import { Link } from "react-router-dom";

export function Footer() {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center gap-2 border border-gray-100/20 rounded-full px-3 py-2 shadow-sm bg-white">
        <div className="cursor-default">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 186 186" 
            fill="none"
          >
            <path 
              fill="currentColor" 
              fillRule="evenodd" 
              d="M7.405 32.617H23.24l.074.57.715 5.454.008.055.008.055 15.778 107.834.926 6.333h106.219l2.187-14.81H53.551l-12.402-84.76H154.6l-2.066 13.436-1.008 6.377 14.583 2.27 1.181-7.379 3.305-21.475 1.055-8.04H38.981l-.274-1.876L38 31.262l-.09-.681-.01-.086-.002-.01v-.004l-.001-.002v-.006l-.001-.002-.011-.085-.09-.682-.715-5.454-.844-6.443H0v14.81h7.405Z" 
            />
            <path 
              fill="currentColor" 
              d="M80.97 170.38c0 6.871-5.571 12.441-12.442 12.441-6.872 0-12.442-5.57-12.442-12.441 0-6.872 5.57-12.442 12.442-12.442 6.87 0 12.441 5.57 12.441 12.442ZM134.284 170.38c0 6.871-5.571 12.441-12.442 12.441s-12.442-5.57-12.442-12.441c0-6.872 5.571-12.442 12.442-12.442s12.442 5.57 12.442 12.442Z" 
            />
            <rect 
              width="14.889" 
              height="22.607" 
              x="96.92" 
              y="64.591" 
              fill="currentColor" 
              rx="7.445" 
            />
            <rect 
              width="14.889" 
              height="22.607" 
              x="122.262" 
              y="64.591" 
              fill="currentColor" 
              rx="7.445" 
            />
            <path 
              fill="currentColor" 
              d="M164.083 86.448a48.058 48.058 0 0 1-16.033 28.917 47.723 47.723 0 0 1-30.862 11.639 47.615 47.615 0 0 1-31.003-11.18 47.914 47.914 0 0 1-16.39-28.676l14.369-2.468a33.297 33.297 0 0 0 11.389 19.928 33.087 33.087 0 0 0 21.545 7.768 33.164 33.164 0 0 0 21.446-8.087 33.401 33.401 0 0 0 11.141-20.095l14.398 2.254Z" 
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-[#25262B]">
          Create your Bitepoint App
        </p>
      </div>
    </div>
  );
}