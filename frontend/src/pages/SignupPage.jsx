import SignupForm from '../components/auth/SignupForm';

const SignupPage = ({ onSignupSuccess, onSwitchToLogin }) => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-4">
                    <span className="text-3xl font-bold text-gray-800">Revisify</span>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-gray-600">
                    Join thousands of learners improving their knowledge.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/70 backdrop-blur-sm py-8 px-4 rounded-lg border border-gray-200 sm:px-10">
                    <SignupForm onSignupSuccess={onSignupSuccess} />
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white/70 text-gray-600">
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={onSwitchToLogin}
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 transition-colors"
                            >
                                Sign in to your account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
