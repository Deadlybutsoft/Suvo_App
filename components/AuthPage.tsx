import React, { useState, useEffect } from 'react';
import { CloseIcon, SpinnerIcon } from './icons';

interface AuthPageProps {
  onClose: () => void;
}

const AuthInput: React.FC<{ id: string, type: string, placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled: boolean }> = ({ id, type, placeholder, value, onChange, disabled }) => (
  <input
    id={id}
    name={id}
    type={type}
    required
    value={value}
    onChange={onChange}
    disabled={disabled}
    placeholder={placeholder}
    autoComplete="email"
    className="w-full p-3 bg-black border border-zinc-600 rounded-md text-white placeholder-zinc-500 focus:ring-1 focus:ring-white outline-none transition disabled:opacity-50"
  />
);

export const AuthPage: React.FC<AuthPageProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };
  
  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    // Supabase logic removed
    setError("Authentication is currently disabled.");
    
    setLoading(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-md bg-black border border-zinc-700 text-slate-800 dark:text-zinc-200 shadow-2xl overflow-hidden rounded-lg transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} disabled={loading} className="absolute top-4 right-4 p-1.5 text-slate-400 dark:text-zinc-500 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 z-20 disabled:opacity-50">
          <CloseIcon className="w-5 h-5" />
        </button>

        <div className="p-10 flex flex-col justify-center">
            <div className="w-full max-w-sm mx-auto text-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome to Suvo</h2>
                <p className="text-slate-500 dark:text-zinc-400 mb-8">Enter your email to log in or sign up.</p>

                {error && (
                    <div className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 relative mb-6 text-sm text-left rounded-md" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                {message && (
                     <div className="bg-green-900/50 border border-green-500/50 text-green-300 px-4 py-3 relative mb-6 text-sm text-left rounded-md" role="alert">
                        <span className="block sm:inline">{message}</span>
                    </div>
                )}
                
                <form onSubmit={handleAuthAction} className="space-y-4">
                    <AuthInput id="email" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} disabled={loading || !!message} />

                    <button type="submit" disabled={loading || !!message} className="w-full p-3 font-semibold text-black bg-white rounded-md hover:bg-zinc-200 transition-colors flex items-center justify-center disabled:opacity-60">
                        {loading ? <SpinnerIcon className="w-6 h-6 text-black" /> : "Continue with Email"}
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};