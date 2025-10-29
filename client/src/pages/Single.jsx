import React, { useEffect, useState, useContext } from "react";
import Edit from "../img/edit.png";
import Delete from "../img/delete.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import axios from "axios";
import moment from "moment";
import { AuthContext } from "../context/authContext";
import DOMPurify from "dompurify";

const Single = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const postId = location.pathname.split("/")[2];

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/posts/${postId}`);
        setPost(res.data);
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [postId]);

  const handleDelete = async () => {
    const ok = window.confirm("Are you sure you want to delete this post?");
    if (!ok) return;

    try {
      await axios.delete(`/posts/${postId}`);
      navigate("/");
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete post");
    }
  };

  // not used but handy if you need plain text
  const getText = (html) => {
    const doc = new DOMParser().parseFromString(html || "", "text/html");
    return doc.body.textContent || "";
  };

  if (loading) return <div className="single">Loading...</div>;
  if (error) return <div className="single">{error}</div>;
  if (!post) return <div className="single">No post found.</div>;

  return (
    <div className="single">
      <div className="content">
        {/* Serve uploads from the root /upload route (matches typical Express static setup) */}
        {post.img && (
          <img
            src={`/upload/${post.img}`}
            alt={post.title || "post image"}
            style={{ maxWidth: "100%" }}
          />
        )}

        <div className="user">
          {/* user image fallback */}
          {post.userImg ? (
            <img src={post.userImg} alt={post.username || "user"} />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#ddd",
              }}
            />
          )}

          <div className="info">
            <span>{post.username || "Unknown"}</span>
            <p>
              Posted{" "}
              {post.date ? moment(post.date).fromNow() : "a while ago"}
            </p>
          </div>

          {/* Guard currentUser before comparing username */}
          {currentUser?.username === post.username && (
            <div className="edit">
              <Link to={`/write`} state={post}>
                <img src={Edit} alt="edit" />
              </Link>
              <img onClick={handleDelete} src={Delete} alt="delete" />
            </div>
          )}
        </div>

        <h1>{post.title}</h1>

        <p
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(post.desc || ""),
          }}
        />
      </div>

      <Menu cat={post.cat} />
    </div>
  );
};

export default Single;
