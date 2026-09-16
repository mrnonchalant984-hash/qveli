"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Megaphone, ShieldCheck, UserCheck, UserPlus } from "lucide-react";

type User = { id: string; name: string; username: string; bio: string; school?: string | null; workplace?: string | null; jobTitle?: string | null; currentCity?: string | null; hometown?: string | null; website?: string | null; avatarUrl?: string | null; professionalMode: boolean; verified: boolean; isProfileBoosted?: boolean };
type Post = { id: string; text: string; imageUrl?: string | null; mediaUrl?: string | null; mediaType?: string | null; author?: { id: string }; };

const initials = (user: User) => user.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();

export default function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { (async () => {
    const { username } = await params;
    const response = await fetch(`/api/users/${encodeURIComponent(username)}`);
    const data = await response.json();
    if (!response.ok) { setError(data.error || 'User not found'); return; }
    setUser(data.user); setFollowing(!!data.following);
    const postsResponse = await fetch('/api/posts?limit=50');
    if (postsResponse.ok) { const postsData = await postsResponse.json(); setPosts((postsData.posts || []).filter((post: Post) => post.author?.id === data.user.id)); }
  })(); }, [params]);

  const follow = async () => {
    if (!user) return;
    const response = await fetch(`/api/users/${user.username}/follow`, { method: 'POST' });
    const data = await response.json();
    if (response.ok) setFollowing(!!data.following); else setError(data.error || 'Unable to update follow');
  };

  if (error) return <main className="simplePage darkPage"><div className="simpleWrap"><p>{error}</p><Link href="/explore">Back to Explore</Link></div></main>;
  return <main className="simplePage publicProfilePage"><header className="simpleTop"><Link href="/explore" className="back"><ArrowLeft size={18}/> Explore</Link><div className="topBrand"><span className="topQ">Q</span><b>Qevli</b></div></header><div className="simpleWrap narrow">{user && <><section className="simpleCard" style={{ textAlign: 'center' }}>{user.avatarUrl ? <img src={user.avatarUrl} className="avatar profileAvatar avatarImg" alt="" /> : <div className="avatar profileAvatar" style={{ margin: '0 auto' }}>{initials(user)}</div>}<h1>{user.name} {user.verified && <ShieldCheck className="blue" size={19} />}</h1><p>@{user.username}</p>{user.professionalMode && <span className="pageEyebrow">Professional mode</span>}{user.isProfileBoosted && <span className="pageEyebrow">Featured profile</span>}<p style={{ maxWidth: 560, margin: '14px auto' }}>{user.bio || 'Qevli member.'}</p><div className="profileDetails publicDetails">{user.workplace && <span>{user.jobTitle ? `${user.jobTitle} at ${user.workplace}` : user.workplace}</span>}{user.school && <span>{user.school}</span>}{user.currentCity && <span>{user.currentCity}</span>}{user.hometown && <span>From {user.hometown}</span>}{user.website && <a href={user.website} target="_blank" rel="noreferrer">Website</a>}</div><div className="profileActions"><button className={following ? 'create' : 'outline'} onClick={follow}>{following ? <><UserCheck size={16}/> Following</> : <><UserPlus size={16}/> Follow</>}</button><Link className="primaryBtn" href="/billing"><Megaphone size={16}/> Promote this profile</Link></div></section><section className="simpleCard"><h2>Posts</h2>{posts.length ? posts.map(post => <article key={post.id} style={{ padding: '14px 0', borderBottom: '1px solid #1b2d46' }}><p>{post.text}</p>{(post.mediaUrl || post.imageUrl) && post.mediaType === 'VIDEO' ? <video controls src={post.mediaUrl || post.imageUrl || ''} style={{ maxWidth: '100%', borderRadius: 10 }} /> : (post.mediaUrl || post.imageUrl) && <img src={post.mediaUrl || post.imageUrl || ''} alt="" style={{ maxWidth: '100%', borderRadius: 10 }} />}</article>) : <p>No posts yet.</p>}</section></>}</div></main>;
}
