import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center strike-gradient-bg p-4">
      <div className="bg-[#0A1128] border border-[#4F6DF5]/20 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-medium text-white mb-6">Page Not Found</h2>
        <p className="text-[#A0AEC0] mb-8">The page you are looking for doesn't exist or has been moved.</p>
        <Link
          href="/login"
          className="inline-block bg-[#4F6DF5] hover:bg-[#4F6DF5]/90 text-white py-2 px-6 rounded-md transition-colors duration-200"
        >
          Go to Login
        </Link>
      </div>
    </div>
  )
}
