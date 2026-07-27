import LogoutBtn from "./LogoutBtn";
import {Link} from 'react-router-dom'
 
function Nav() {
  return (
    <nav>
        <ul>
            <li>
                <Link to="/categories">categories</Link>
            </li>
            <li>
                <Link to="/products">products</Link>
            </li>
            <li>
                <LogoutBtn/>
            </li>
        </ul>
    </nav>
  )
}

export default Nav