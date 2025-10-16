import { useState } from "react";
import api from "../api";
import "../App.css";
import { toast } from "react-toastify";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to create a post!");
      return;
    }

    try {
      await api.post(
        "/posts",
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setContent("");
      toast.success("Post created successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create post.");
    }
  };

  return (
    <div className="container">
      <h1>Create Post</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Post Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="6"
          required
        ></textarea>
        <button type="submit">Create Post</button>
      </form>
    </div>
  );
}

export default CreatePost;
