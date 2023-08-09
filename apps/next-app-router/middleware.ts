import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Clone the request headers
  // You can modify them with headers API: https://developer.mozilla.org/en-US/docs/Web/API/Headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('user-agent', 'New User Agent overriden by middleware!')
  requestHeaders.set('Access-Control-Allow-Credentials', 'true')
  requestHeaders.set('Access-Control-Allow-Origin', 'preview-kit-test-studio.sanity.build')
  requestHeaders.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  requestHeaders.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
  requestHeaders.delete('x-frame-options')

  // You can also set request headers in NextResponse.rewrite
  return NextResponse.next({
    request: {
      // New request headers
      headers: requestHeaders,
    },
  })
}