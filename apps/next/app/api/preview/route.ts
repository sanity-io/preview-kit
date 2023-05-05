import { routeSlug } from 'ui'
import { draftMode } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
// import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = routeSlug(searchParams.get('slug')!)

  draftMode().enable()

  // @TODO why doesn't it work?
  // return redirect(`/${slug}`)
  return NextResponse.redirect(new URL(`/${slug}`, request.nextUrl.origin))
}
