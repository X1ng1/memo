import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './Home'
import CalendarPage from './CalendarPage'
import JournalEntry from './JournalEntry'
import Login from './Login'
import Register from './Register'
import SavedEntry from './SavedEntry'
import './App.css'
import ProtectedRoute from './ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />}/>
        <Route path="/register" element={<Register />}/>
        <Route element={<ProtectedRoute />}>
          <Route path="/"  element={<Home />} />
          <Route path="/calendar" element={<CalendarPage/>}/>
          <Route path="/journal/:date" element={<JournalEntry/>}/>
          <Route path="/saved-entry/:date" element={<SavedEntry/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
