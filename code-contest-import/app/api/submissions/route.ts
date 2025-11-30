import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, language, problemId, contestId } = body

    // Validate required fields (matching backend validation)
    if (!code || !language || !problemId) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields",
        details: [
          { field: "code", message: "Code is required" },
          { field: "language", message: "Language is required" },
          { field: "problemId", message: "Problem ID is required" }
        ]
      }, { status: 400 })
    }

    // Get auth token from cookies
    const cookieStore = cookies()
    const authToken = cookieStore.get('auth-token')?.value

    if (!authToken) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 })
    }

    // Forward request to backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || 'unknown'
      },
      body: JSON.stringify({
        code,
        language,
        problemId,
        contestId: contestId || null
      })
    })

    const responseData = await backendResponse.json()

    // Return backend response with proper status
    return NextResponse.json(responseData, { 
      status: backendResponse.status 
    })

  } catch (error) {
    console.error('Frontend API submission error:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Submission processing failed",
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cookieStore = cookies()
    const authToken = cookieStore.get('auth-token')?.value

    if (!authToken) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 })
    }

    // Forward GET request to backend with query parameters
    const queryString = searchParams.toString()
    const backendResponse = await fetch(`${BACKEND_URL}/api/submissions?${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })

    const responseData = await backendResponse.json()
    return NextResponse.json(responseData, { 
      status: backendResponse.status 
    })

  } catch (error) {
    console.error('Frontend API get submissions error:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch submissions" 
    }, { status: 500 })
  }
}
