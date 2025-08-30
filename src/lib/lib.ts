import { IronSession, SessionOptions, getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import * as client from 'openid-client'

export const clientConfig = {
  url: process.env.NEXT_PUBLIC_API_URL,
  audience: process.env.NEXT_PUBLIC_API_URL,
  client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
  scope: process.env.NEXT_PUBLIC_SCOPE,
  redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/openiddict`,
  post_logout_redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}`,
  response_type: 'code',
  grant_type: 'authorization_code',
  post_login_route: `${process.env.NEXT_PUBLIC_APP_URL}`,
  registration_route: `${process.env.NEXT_PUBLIC_APP_URL}/registration`,
  code_challenge_method: 'S256'
}

export interface RegistrationInfo {
  user_id: number
  username: string
  root_folder_id: number
}

export interface UserInfo {
  sub: string
  first_name: string
  last_name: string
  email: string
  email_verified: boolean
  registration_info?: RegistrationInfo
}

export interface SessionData {
  isLoggedIn: boolean
  access_token?: string
  code_verifier?: string
  state?: string
  userInfo?: UserInfo
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
  access_token: undefined,
  code_verifier: undefined,
  state: undefined,
  userInfo: undefined,
}

export const sessionOptions: SessionOptions = {
  password: 'complex_password_at_least_32_characters_long',
  cookieName: 'imgarch_ux_session',
  cookieOptions: {
    // secure only works in `https` environments
    // if your localhost is not on `https`, then use: `secure: process.env.NODE_ENV === "production"`
    secure: process.env.NODE_ENV === 'production',
  },
  ttl: 60 * 60 * 24 * 7, // 1 week
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookiesList = await cookies()
  let session = await getIronSession<SessionData>(cookiesList, sessionOptions)
  if (!session.isLoggedIn) {
    session.access_token = defaultSession.access_token
    session.userInfo = defaultSession.userInfo
  }
  return session
}

export async function getClientConfig() {
    const options1={execute:[client.allowInsecureRequests]};
  return await client.discovery(new URL(clientConfig.url!), clientConfig.client_id!, undefined, undefined, options1)
}
