import Login from '@/components/Login'
import { getSession } from '@/lib/lib'

export default async function Home() {
  const session = await getSession()
  if (session.userInfo === undefined
    || session.userInfo.registration_info === undefined) {
      // redirect to registration page
      
    }

  return (
    <main>
      <div style={{display:'flex', height:'30vh', justifyContent:'center'}}>
        <div style={{fontSize:'10vh'}}>
          <div>Image</div>
          <div style={{position:'relative', top:'-5vh'}}>
            <div style={{float:'left'}}>Arch</div>
            <img src="/file_cabinet_drawer.png" style={{height:'10vh', float:'left', position:'relative', top:'2vh', left:'10px'}}/>
          </div>
        </div>
      </div>
      <div style={{width:'50%', marginLeft:'auto', marginRight:'auto', textAlign:'center'}}>
        <h1>
          Welcome back
        </h1>
        <p>Sign in to your account to continue.</p>
        <div>
          <pre>{JSON.stringify(session, null, 2)}</pre>
        </div>
        <Login />
      </div>
    </main>
  )
}
