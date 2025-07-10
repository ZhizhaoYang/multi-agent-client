import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" href="/">
        Go Home
      </Link>
    </div>
  );
}