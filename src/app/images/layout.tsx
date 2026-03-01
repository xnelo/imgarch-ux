'use client'
import { useSelectedLayoutSegment } from "next/navigation";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const segment = useSelectedLayoutSegment()
  
  return (
    <div>
        <nav className="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
            <div className="container-fluid">
                <span className="navbar-brand">
                    Image Arch
                </span>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                  <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                      <a className={`nav-link ${segment === 'folder' ? 'active' : ''}`} href="/images/folder">Folders</a>
                    </li>
                    <li className="nav-item">
                      <a className={`nav-link ${segment === 'search' ? 'active' : ''}`} href="/images/search">Search</a>
                    </li>
                  </ul>
                </div>

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