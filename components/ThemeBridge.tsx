"use client";
import {useEffect} from "react";
export default function ThemeBridge(){useEffect(()=>{const t=(localStorage.getItem("qevli-theme")||"light");document.documentElement.dataset.theme=t;},[]);return null;}
