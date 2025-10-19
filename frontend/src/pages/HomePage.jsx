import { useState } from 'react';
import { Sparkles, BookOpen, Zap, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react';

export default function HomePage({ onLoginClick, onSignupClick }) {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Smart PDF Upload",
      description: "Upload up to 10 PDFs at once. Our AI processes them instantly and makes them searchable.",
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "AI Chat Interface",
      description: "Ask questions about your study materials. Get instant, accurate answers with source citations.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Smart Quiz Generation",
      description: "AI creates custom MCQ, SAQ, and LAQ questions. Get instant grading with detailed feedback.",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Progress Tracking",
      description: "Monitor your learning journey. Track quiz attempts, scores, and improvement over time.",
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100 text-gray-900 overflow-hidden">
      {/* Subtle background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-40 right-40 w-96 h-96 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-40 left-40 w-96 h-96 bg-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center px-8 py-6 bg-white/40 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-8 h-8 text-gray-700" />
          <span className="text-2xl font-bold text-gray-800">
            Revisify
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={onLoginClick}
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors duration-200"
          >
            Login
          </button>
          <button
            onClick={onSignupClick}
            className="px-6 py-2.5 text-sm font-semibold bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all duration-200"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-block mb-6 px-4 py-2 bg-gray-200/60 border border-gray-300 rounded-full backdrop-blur-sm">
            <span className="text-sm font-semibold text-gray-700">✨ AI-Powered Learning Platform</span>
          </div>

          <h1 className="text-6xl lg:text-7xl font-bold mb-6 leading-tight text-gray-900">
            <span>Study Smarter,</span>
            <br />
            <span>Learn Faster</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Transform your study materials into interactive learning experiences. Upload PDFs, chat with AI about your content, generate custom quizzes, and track your progress—all in one intelligent platform.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <button
              onClick={onSignupClick}
              className="group px-8 py-4 text-lg font-semibold bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onLoginClick}
              className="px-8 py-4 text-lg font-semibold bg-white text-gray-900 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-300"
            >
              Login to Account
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
              className={`group relative p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 cursor-pointer transform ${
                hoveredFeature === index
                  ? 'border-gray-400 bg-white/70 shadow-lg'
                  : 'border-gray-200 bg-white/50 hover:border-gray-300'
              }`}
            >
              <div className="relative z-10">
                <div className="mb-4 p-3 rounded-lg w-fit bg-gray-200 text-gray-700">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20 text-center">
          <div className="p-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200">
            <div className="text-4xl font-bold text-gray-800 mb-2">100%</div>
            <p className="text-gray-600">AI-Powered Learning</p>
          </div>
          <div className="p-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200">
            <div className="text-4xl font-bold text-gray-800 mb-2">10+</div>
            <p className="text-gray-600">PDFs Supported</p>
          </div>
          <div className="p-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200">
            <div className="text-4xl font-bold text-gray-800 mb-2">∞</div>
            <p className="text-gray-600">Learning Possibilities</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '1', title: 'Upload', description: 'Add your PDF study materials' },
              { number: '2', title: 'Chat', description: 'Ask AI questions about content' },
              { number: '3', title: 'Quiz', description: 'Get AI-generated custom quizzes' },
              { number: '4', title: 'Learn', description: 'Track progress and improve' }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-800 text-white flex items-center justify-center text-2xl font-bold mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 text-center">{step.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 -right-4 text-2xl text-gray-400">→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative rounded-3xl overflow-hidden bg-white/60 border border-gray-300 p-12 text-center backdrop-blur-sm">
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Ready to Transform Your Learning?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of students using Revisify to study smarter, not harder.
            </p>
            <button
              onClick={onSignupClick}
              className="px-10 py-4 text-lg font-semibold bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-all duration-300 transform hover:scale-105"
            >
              Start Your Free Journey Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
