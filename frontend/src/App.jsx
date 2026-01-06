import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminPeriods from './pages/admin/Periods'
import AdminEvents from './pages/admin/Events'
import AdminNotifications from './pages/admin/Notifications'
import Profile from './pages/Profile'
import UserContext from './context/UserContext'
import Periodcontextprovider from './context/Periodcontextprovider'
import PrivateHomeRoute from './components/PrivateHomeRoute'
import PrivateAdminRoute from './components/PrivateAdminRoute'

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
          <Route path='/profile' element={
            <PrivateHomeRoute>
              <Profile />
            </PrivateHomeRoute>
          } />
          <Route path='/admin' element={
            <PrivateAdminRoute>
              <AdminDashboard />
            </PrivateAdminRoute>
          } />
          <Route path='/admin/users' element={
            <PrivateAdminRoute>
              <AdminUsers />
            </PrivateAdminRoute>
          } />
          <Route path='/admin/periods' element={
            <PrivateAdminRoute>
              <AdminPeriods />
            </PrivateAdminRoute>
          } />
          <Route path='/admin/events' element={
            <PrivateAdminRoute>
              <AdminEvents />
            </PrivateAdminRoute>
          } />
          <Route path='/admin/notifications' element={
            <PrivateAdminRoute>
              <AdminNotifications />
            </PrivateAdminRoute>
          } />
        </Routes>
      </BrowserRouter>
    </div>
    </UserContext>
    </Periodcontextprovider>
  )
}

export default App