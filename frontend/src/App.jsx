import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import UserContext from './context/UserContext'
import Periodcontextprovider from './context/Periodcontextprovider'
import PrivateHomeRoute from './components/PrivateHomeRoute'
const App = () => {
  return (
    <Periodcontextprovider>
    <UserContext>
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login />}/>
          <Route path='/signup' element={<Signup />} />
          <Route path='/home' element={
            <PrivateHomeRoute>
              <Home />
            </PrivateHomeRoute>
          } />
        </Routes>
      </BrowserRouter>
    </div>
    </UserContext>
    </Periodcontextprovider>
  )
}

export default App