import { useState } from 'react'
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import OAuthCallback from './components/OAuthCallback';
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import PersistLogin from "./components/PersistLogin";
import Home from "./components/Home";
import Missing from "./components/Missing";
import CategoryList from "./components/category/List.jsx"
import CreateCategory from "./components/category/Create.jsx"
import EditCategory from "./components/category/Edit.jsx"
import ProductList from './components/product/List.jsx';
import CreateProduct from './components/product/Create.jsx';
import EditProduct from './components/product/Edit.jsx';

function App() {
 
  return (
    
    <Routes>
       <Route path="login" element={<Login />} />
       <Route path="register" element={<Register />} />
       <Route path="/oauth-callback" element={<OAuthCallback />} />
            
    <Route element={<PersistLogin />}>
        <Route element={<RequireAuth />}> 
          
      
          <Route path="/" element={<Layout />}>
                 <Route path="/" element={<Home />} />
                 <Route path="categories" element={<CategoryList/>} />
                 <Route path="createcategory" element={<CreateCategory/>} />
                 <Route path="category/:id/edit" element={<EditCategory/>} />
                 <Route path="products" element={<ProductList/>} />
                 <Route path="createproduct" element={<CreateProduct/>} />
                 <Route path="product/:id/edit" element={<EditProduct/>}/>
           </Route>

        </Route> 
       
      </Route>

       {/* Fallbacks & Redirects */}
       
        <Route path="*" element={<Missing/>} />
    </Routes>

  )
}

export default App
