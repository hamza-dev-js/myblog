import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "../App.css";

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/posts")
      .then((res) => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading posts...</div>;

  return (
    <div className="container">
      <h1>All Posts</h1>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map(post => (
          <div key={post.id} className="post-card">
            <Link to={`/posts/${post.id}`}>
              <h2>{post.title}</h2>
            </Link>
            <p>{post.content.substring(0, 100)}...</p>
            {/* Use any available field for author, fallback to "Unknown" */}
            <small>By {post.author || post.username || "Unknown"}</small>
          </div>
        ))
      )}
    </div>
  );
}

export default Home;
