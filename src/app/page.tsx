import Image from 'next/image'
import Login from '@/components/Login'
import { getSession } from '@/lib/lib'
import logger from '@/lib/logger';

export default async function Home() {
  const session = await getSession();
  logger.debug(JSON.stringify(session, null, 2));

  return (
    <main>
      <div style={{display:'flex', height:'30vh', justifyContent:'center'}}>
        <div style={{fontSize:'10vh'}}>
          <div>Image</div>
          <div style={{position:'relative', top:'-5vh'}}>
            <div style={{float:'left'}}>Arch</div>
            <Image src="/file_cabinet_drawer.png" alt='File Cabinet Drawer' width={100} height={100} style={{float:'left', position:'relative', top:'2vh', left:'10px'}}/>
          </div>
        </div>
      </div>
      <div style={{width:'50%', marginLeft:'auto', marginRight:'auto', textAlign:'center'}}>
        <h1>
          Welcome back
        </h1>
        <p>Sign in to your account to continue.</p>
        <Login />
      </div>
    </main>
  )
}
