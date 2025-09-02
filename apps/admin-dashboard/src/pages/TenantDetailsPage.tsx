import React from 'react'
import { useParams } from 'react-router-dom'

const TenantDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Franchise Details</h1>
        <p className="mt-1 text-sm text-gray-500">
          Detailed view of franchise {id}
        </p>
      </div>

      <div className="card">
        <p className="text-gray-600">Franchise details page - Coming soon!</p>
      </div>
    </div>
  )
}

export default TenantDetailsPage
