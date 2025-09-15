import Image from 'next/image'

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        <nav className="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
            <div className="container-fluid">
                <span className="navbar-brand">
                    Image Arch
                </span>
                <div className='d-flex dropdown'>
                  <button 
                    className='btn btn-primary' 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false" 
                    style={{padding: '10px 10px 5px 8px'}}>
                    <i 
                      className="bi bi-person-circle" 
                      style={{fontSize: '1.5rem'}}/>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><a className="dropdown-item" href="/auth/logout">Logout</a></li>
                  </ul>
                </div>
            </div>
        </nav>
        {children}
    </div>
  );
}