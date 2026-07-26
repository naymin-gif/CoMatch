"use client"

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/clients';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import Link from 'next/link';
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { IoEyeOffOutline } from "react-icons/io5";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    // Functions
    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(''); 

        const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        });

        if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        } else {
        router.push('/');
        router.refresh(); 
        }
    };

    const handleOAuthLogin = async (provider: 'google' | 'linkedin_oidc') => {
        const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
        });

        if (error) {
        setErrorMsg(error.message);
        }
    };

    return (
        <div className="min-h-[calc(100dvh-61px)] flex items-center justify-center bg-gray-50 p-4 font-sans">            
            <Card className="max-w-md w-full flex flex-col justify-center p-5">
                {/* Header  */}
                <CardHeader className="flex flex-col items-center text-center">
                    <div className="flex flex-row gap-3 items-center">
                        <Image src="/pics/logo.png" alt="CoMatch logo" width={60} height={60} />
                        <CardTitle className="font-heading text-heading">
                            CoMatch
                        </CardTitle>
                    </div>
                    <CardDescription>
                        This is where the best teams are born. 
                    </CardDescription>
                </CardHeader>

                {/* Body */}
                <CardContent className="flex flex-col gap-5">
                    <form 
                        onSubmit={handleEmailLogin}
                        className="flex flex-col gap-5"
                    >
                        {/* Error Message Display */}
                        {errorMsg && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {errorMsg}
                            </div>
                        )}

                        {/* Email  */}
                        <div className="flex flex-col gap-2">
                            <span>Email</span>
                            <Input id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        {/* Password  */}
                        <div className="flex flex-col gap-2">
                            <span>Password</span>
                            <div className="relative">
                                <Input id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                                    placeholder="••••••••"
                                    required 
                                />
                                <button
                                    type="button"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                >
                                    {showPassword ? (
                                        <MdOutlineRemoveRedEye />
                                    ) : (
                                        <IoEyeOffOutline />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me and Forgot Password  */}
                        <div className="flex flex-row gap-3 items-center">
                            <Checkbox /> 
                            <span>Remember me</span>
                        </div>

                        {/* Sign In Button  */}
                        <Button 
                            className="h-[40px]"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                            Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Google and LinkedIn Buttons */}
                    <Button 
                        type="button"
                        variant="green" 
                        className="h-[40px]"
                        onClick={() => handleOAuthLogin('google')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 48 48"
                            className="w-5 h-5"
                        >
                            <path
                                fill="#FFC107"
                                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                            />
                            <path
                                fill="#FF3D00"
                                d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                            />
                            <path
                                fill="#4CAF50"
                                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                            />
                            <path
                                fill="#1976D2"
                                d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                            />
                        </svg>
                        Continue with Google
                    </Button>
                    <Button 
                        variant="blue" 
                        type="button"
                        className="h-[40px]"
                        onClick={() => handleOAuthLogin('linkedin_oidc')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5"
                        >
                            <path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z" />
                        </svg>
                        Continue with LinkedIn 
                    </Button>

                    {/* Sign Up */}
                    <div className="flex flex-row items-center">
                        <span>Don't have an account? </span>
                        <Link href="/register">
                            <Button 
                                type="button"
                                variant="link" >
                                Sign up for free
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}