import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Search } from 'lucide-react'

export default function CategoryNotFound() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Category Not Found
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              The category you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="default" size="lg">
                <Link href="/news">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Browse News
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/">Go to Homepage</Link>
              </Button>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              You can also use the search functionality to find specific articles or topics.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
