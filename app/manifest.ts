import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest { return { name:'Qevli', short_name:'Qevli', description:'Connect. Share. Grow.', start_url:'/dashboard', display:'standalone', background_color:'#080d1f', theme_color:'#2563eb', icons:[] }; }
