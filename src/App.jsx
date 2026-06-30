import { useState } from 'react'
import { RouterProvider } from "react-router-dom";
import route from './route.js'
function App() {

  return (
    <>
      <RouterProvider router={route} />
    </>
  )
}

export default App
