import { Outlet } from "react-router-dom";
import Nav from "./Nav";
import { useAuth } from "../hooks/useAuth";


const Layout = () => {
      const { auth } = useAuth();
    console.log(auth)
    return (
        <main className="App">
            <Nav/>
            <Outlet />
        </main>
    )
}

export default Layout
