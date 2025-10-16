import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import "../App.css";
import { toast } from "react-toastify";

function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/posts/${id}`)
      .then(res => setPost(res.data))
      .catch(err => console.error(err));
  }, [id]);

  useEffect(() => {
    api.get(`/comments/${id}`)
      .then(res => setComments(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to comment!");
      return;
    }

    try {
      await api.post(`/comments`, { post_id: id, content: newComment }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewComment("");
      toast.success("Comment added!");
      const res = await api.get(`/comments/${id}`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add comment.");
    }
  };

  if (loading) return <div className="loading">Loading post...</div>;
  if (!post) return <div className="container">Post not found</div>;

  return (
    <div className="container">
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <small>By {post.author ? post.author : "Unknown"}</small>

      <hr />
      <h3>Comments</h3>
      {comments.length === 0 ? <p>No comments yet.</p> : (
        comments.map(c => (
          <div key={c.id} className="post-card">
            <p>{c.content}</p>
            <small>By {c.username ? c.username : "Unknown"}</small>
          </div>
        ))
      )}

      <form onSubmit={handleAddComment}>
        <textarea
          placeholder="Add a comment..."
          rows="3"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
        ></textarea>
        <button type="submit">Submit Comment</button>
      </form>
    </div>
  );
}

export default PostDetails;
