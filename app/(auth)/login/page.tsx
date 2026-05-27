'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // TODO: Teammate will replace this with Supabase signInWithPassword
        console.log('Attempting to login with:', email, password);

        // Mocking a network request delay
        setTimeout(() => {
            setIsLoading(false);
            alert('Supabase auth will trigger here!');
        }, 1000);
    };

    const handleOAuthLogin = (provider: string) => {
        // TODO: Teammate will replace this with Supabase signInWithOAuth
        console.log(`Initiating ${provider} login...`);
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border p-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-2 mb-2">
                        <Image src="/logo.png" alt="CoMatch logo" width={60} height={60} />
                        <h1 className="text-2xl font-bold text-gray-900">CoMatch</h1>
                    </div>
                    <p className="text-sm text-gray-500">Welcome back! Please enter your details.</p>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                            Remember me
                        </label>
                        <Link href="#" className="text-sm text-blue-600 hover:underline font-medium">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-70 mt-2"
                    >
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                </div>

                {/* SSO Buttons */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => handleOAuthLogin('Google')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-colors font-medium bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                        </svg>
                        Continue with Google
                    </button>
                    <button
                        onClick={() => handleOAuthLogin('LinkedIn')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-colors font-medium bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z" />
                        </svg>
                        Continue with LinkedIn
                    </button>
                </div>

                {/* Sign up link */}
                <p className="mt-8 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                        Sign up for free
                    </Link>
                </p>
            </div>
        </main>
    );
}