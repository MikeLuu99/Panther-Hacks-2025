import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Image 
        src="/doctor.svg"
        alt="Doctor"
        width={200}
        height={200}
        priority
      />
      <h2 className="text-2xl font-bold mt-8 mb-4">Page Not Found</h2>
      <p className="text-slate-600 mb-8">Could not find the requested resource</p>
      <Link 
        href="/"
        className="text-indigo-600 hover:text-indigo-700 font-medium"
      >
        Return Home
      </Link>
    </div>
  )
}