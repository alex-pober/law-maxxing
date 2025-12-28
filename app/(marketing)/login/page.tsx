import AuthForm from "./auth-form";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Welcome to Law Maxxing
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Your law study notes companion
                    </p>
                </div>
                <AuthForm />
            </div>
        </div>
    );
}
