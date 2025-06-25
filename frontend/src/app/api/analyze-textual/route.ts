import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  return NextResponse.json(
    { message: 'Textual analysis endpoint not implemented.' },
    { status: 501 }
  )
}
