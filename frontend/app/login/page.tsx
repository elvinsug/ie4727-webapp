"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/miona/api";

const LoginPage = () => {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			// Create FormData for PHP backend
			const formData = new FormData();
			formData.append("email", email);
			formData.append("password", password);

			const response = await fetch(`${API_URL}/login.php`, {
				method: "POST",
				body: formData,
				credentials: "include", // Important for session cookies
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Login failed");
			}

			if (data.success) {
				// Store user data in localStorage
				localStorage.setItem("user", JSON.stringify(data.user));

				// Redirect based on user role
				if (data.user.role === "admin") {
					router.push("/admin");
				} else {
					router.push("/");
				}
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred during login");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12">
			{/* Logo */}
			<div className="mb-12">
				<Image
					src={`${BASE_PATH}/logo-black.svg`}
					alt="Logo"
					width={251}
					height={48}
				/>
			</div>

			{/* Login Form Container */}
			<div className="w-full max-w-md">
				<div className="bg-white rounded-2xl border border-gray-200 p-8">
					<h1 className="text-2xl font-semibold text-center mb-8 text-gray-900">
						Log in to your account
					</h1>

					{error && (
						<div className="p-3 rounded-lg bg-red-50 border border-red-200">
							<p className="text-sm text-red-600">{error}</p>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-5">
						{/* Email Field */}
						<div className="space-y-2">
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-900"
							>
								Email
							</label>
							<Input
								id="email"
								type="email"
								placeholder="name@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="h-11"
							/>
						</div>

						{/* Password Field */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-900"
								>
									Password
								</label>
								<Link
									href="/forgot-password"
									className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
								>
									Forgot password?
								</Link>
							</div>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="h-11 pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth={1.5}
											stroke="currentColor"
											className="w-5 h-5"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
											/>
										</svg>
									) : (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth={1.5}
											stroke="currentColor"
											className="w-5 h-5"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
											/>
										</svg>
									)}
								</button>
							</div>
						</div>

						{/* Submit Button */}
						<Button
							type="submit"
							className="w-full h-11 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
						>
							Log in
						</Button>
					</form>
				</div>

				{/* Sign Up Link */}
				<p className="text-center mt-6 text-sm text-gray-600">
					Don't have an account?{" "}
					<Link
						href="/signup"
						className="font-semibold text-gray-900 hover:underline"
					>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
};

export default LoginPage;
