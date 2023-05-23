import { draftMode } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export function GET(req: NextRequest) {
  if (draftMode().isEnabled) {
    draftMode().disable()
  } else {
    draftMode().enable()
  }
  const url = new URL(req.nextUrl)
  return NextResponse.redirect(new URL('/', url.origin))
}
