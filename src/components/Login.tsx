'use client'
import useSession from '@/hooks/useSession'

const Login = () => {
  const { session, loading } = useSession()
  if (loading) {
    return <div>Loading...</div>
  }
  if (session?.isLoggedIn) {
    return (
      <button
        className="btn btn-primary col-2"
        onClick={() => {
          window.location.href = '/auth/logout'
        }}
      >
        Logout
      </button>
    )
  }
  return (
    <button
      className="btn btn-primary col-2"
      onClick={() => {
        window.location.href = '/auth/login'
      }}
    >
      Login
    </button>
  )
}

export default Login
