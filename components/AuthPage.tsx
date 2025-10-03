import React, { useState, useEffect } from 'react';
import { CloseIcon, CursorArrowIcon } from './icons';

interface AuthPageProps {
  onClose: () => void;
  onTryDemo: () => void;
}

const SocialButton: React.FC<{ onClick: () => void; icon: React.FC<{className?: string}>; children: React.ReactNode; disabled?: boolean }> = ({ onClick, icon: Icon, children, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-3 p-3 font-semibold text-white bg-zinc-900 border border-zinc-700 rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
        <Icon className="w-5 h-5" />
        <span>{children}</span>
    </button>
);


export const AuthPage: React.FC<AuthPageProps> = ({ onClose, onTryDemo }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };
  
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Email Login is coming soon!");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-sm bg-black border border-zinc-700 text-slate-800 dark:text-zinc-200 shadow-2xl overflow-hidden rounded-lg transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 text-slate-400 dark:text-zinc-500 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 z-20">
          <CloseIcon className="w-5 h-5" />
        </button>

        <div className="p-10 flex flex-col justify-center">
            <div className="w-full max-w-sm mx-auto text-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome to Suvo</h2>
                <p className="text-slate-500 dark:text-zinc-400 mb-8">Sign in to continue or try the demo.</p>

                <div className="space-y-4">
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-white outline-none transition"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-white outline-none transition"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-3 p-3 font-semibold text-black bg-white rounded-md hover:bg-zinc-200 transition-colors"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-zinc-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-black px-2 text-zinc-500">OR</span>
                        </div>
                    </div>

                    <button
                        onClick={onTryDemo}
                        className="w-full flex items-center justify-center gap-3 p-3 font-semibold text-black bg-white rounded-md hover:bg-zinc-200 transition-colors"
                    >
                        <CursorArrowIcon className="w-5 h-5" />
                        <span>Try Demo</span>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};