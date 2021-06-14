import React from 'react'
import {Link} from 'react-router-dom'
const Navbar = ()=>{
   return(
    <nav className="navbar bg-dark">
    <h1>
      <a href="dashboard.html"> <i className="fas fa-code"></i> APARTMENT HUNT </a>
    </h1>
    <ul>
      <Link to='/profile'>Profile</Link>
      <Link to='/register'>Register</Link>
      <Link to='/login'>Login</Link>
    </ul>
    </nav>
   )
}

export default Navbar