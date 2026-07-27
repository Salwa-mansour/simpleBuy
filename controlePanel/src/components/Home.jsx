import { useAuth } from "../hooks/useAuth";
import Nav from "./Nav";


const Home = () => {
    const { auth } = useAuth();

    return (
        <>
        <Nav/>
        <section>
            <h1>Home</h1>
            <br />
            <p>wellcom {auth?.username || 'Guest'}</p>
         
        
        </section>
        </>
        
    )
}

export default Home
