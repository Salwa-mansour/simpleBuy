import { useAuth } from "../hooks/useAuth";
import ProductList from "./product/List";


const Home = () => {
    const { auth } = useAuth();

    return (
        <section>
         
            <ProductList/>
        
        </section>
    )
}

export default Home
