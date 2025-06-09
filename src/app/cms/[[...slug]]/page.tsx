'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface PageProps {
  params: { slug?: string[] }
}

export default function CMSPage({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const slug = params?.slug || []

  const adminUrl = process.env.NEXT_PUBLIC_PAYLOAD_ADMIN_URL

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.replace('/')
      return
    }
    const roles = session?.user?.roles || []
    const isAdmin = roles.includes('AdminFull') || roles.includes('AdminReadOnly')
    if (!isAdmin) {
      router.replace('/')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return <div className="p-6 text-center">Loading...</div>
  }

  const roles = session?.user?.roles || []
  const isAdmin = roles.includes('AdminFull') || roles.includes('AdminReadOnly')
  if (!isAdmin) {
    return <div className="p-6 text-center">Access denied.</div>
  }

  if (!adminUrl) {
    return <div className="p-6 text-center">CMS URL not configured.</div>
  }

  const path = slug.length ? '/' + slug.join('/') : ''
  const url = adminUrl + path

  return (
    <iframe src={url} className="w-full min-h-screen border-0" />
  )
}
