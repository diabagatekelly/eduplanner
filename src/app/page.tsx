"use client"

import { useDispatch } from "react-redux";
import Navbar from "./ui/navbar"
import { useEffect } from "react";
import { hasToken } from "./actions/authActions";

export default function Home() {

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(hasToken())
  }, []);
  
  return (
    <>
      <Navbar />
      <h1>Hello, Next.js!</h1>
    </>
  )
}
