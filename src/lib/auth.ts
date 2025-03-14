import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { API_URL } from "./constants"

interface CustomUser {
  id: string
  email: string
  name: string
  token: string
}

interface LoginResponse {
  access_token: string
  token_type: string
  user?: {
    email: string
    name?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials")
          return null
        }

        try {
          console.log('Auth attempt:', {
            url: `${API_URL}/api/auth/login`,
            email: credentials.email,
            apiUrl: API_URL
          })
          
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          console.log('Auth response status:', response.status)

          if (!response.ok) {
            const errorText = await response.text()
            console.error('Authentication failed:', {
              status: response.status,
              statusText: response.statusText,
              error: errorText
            })
            return null
          }

          const data = await response.json() as LoginResponse
          console.log('Auth success:', { email: credentials.email })
          
          return {
            id: credentials.email,
            email: credentials.email,
            name: data.user?.name || credentials.email,
            token: data.access_token,
          }
        } catch (error) {
          console.error("Auth error details:", {
            error,
            apiUrl: API_URL,
            email: credentials.email
          })
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('JWT callback - user found:', { email: user.email })
        token.token = (user as CustomUser).token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        console.log('Session callback - updating token')
        session.user.token = token.token as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
} 