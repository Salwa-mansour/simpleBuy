import { Outlet } from "react-router-dom";
import Nav from "./Nav";
import { useAuth } from "../hooks/useAuth";
import Footer from "./Footer";


const Layout = () => {
      const { auth } = useAuth();
    // console.log(auth)
    return (
        <>
        <main className="App">
            <Nav/>
            <Outlet />
            <Footer/>
        </main>
      
        </>
    )
}

export default Layout
