import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const [wsStatus, setWsStatus] = useState("Disconnected");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(() => localStorage.getItem("chatUser") || "User" + Math.floor(Math.random() * 1000));
  const [text, setText] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("chatUser", user);
  }, [user]);

  useEffect(() => {
    const ws = new WebSocket("wss://chatroom-server.onrender.com");
    wsRef.current = ws;

    ws.onopen = () => setWsStatus("Connected");
    ws.onclose = () => setWsStatus("Disconnected");
    ws.onerror = () => setWsStatus("Error");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "history") {
        setMessages(data.payload);
      } else if (data.type === "message") {
        setMessages((prev) => [...prev, data.payload]);
      }
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    };

    return () => ws.close();
  }, []);

  function sendMessage(e) {
    e.preventDefault();
    if (!text.trim()) return;

    const msg = {
      type: "message",
      payload: {
        user,
        text: text.trim(),
      },
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
    setText("");
  }

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        {/* HEADER */}
        <header style={styles.header}>
          <h3>💬 Chat Room</h3>
          <div style={styles.headerRight}>
            <div
              style={{
                ...styles.statusDot,
                background: wsStatus === "Connected" ? "#4caf50" : "red",
              }}
              title={`Status: ${wsStatus}`}
            ></div>
            <div style={styles.avatarWrapper}>
              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                alt="Profile"
                style={styles.avatar}
                onClick={() => setShowProfile(!showProfile)}
              />
              {showProfile && (
                <div style={styles.profileMenu}>
                  <h4 style={{ marginBottom: 8 }}>Edit Profile</h4>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Your Name</label>
                  <input
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    style={styles.nameInput}
                  />
                  <button
                    onClick={() => setShowProfile(false)}
                    style={styles.closeBtn}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MESSAGES */}
        <div style={styles.messages}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                ...styles.message,
                ...(m.user === user ? styles.myMessage : styles.otherMessage),
              }}
            >
              <div style={styles.name}>{m.user}</div>
              <div>{m.text}</div>
              <div style={styles.time}>
                {new Date(m.ts).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
          <div ref={bottomRef}></div>
        </div>

        {/* MESSAGE INPUT */}
        <form onSubmit={sendMessage} style={styles.form}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            style={styles.input}
          />
          <button type="submit" style={styles.sendBtn}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#e5ddd5",
    height: "100vh",
    padding: 10,
  },
  chatBox: {
    width: "100%",
    maxWidth: 600,
    height: "90vh",
    background: "#fff",
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    position: "relative",
  },
  header: {
    background: "#075e54",
    color: "#fff",
    padding: "10px 15px",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    position: "relative",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
  },
  avatarWrapper: {
    position: "relative",
    cursor: "pointer",
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: "50%",
    border: "2px solid #fff",
  },
  profileMenu: {
    position: "absolute",
    top: 45,
    right: 0,
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    borderRadius: 8,
    padding: 12,
    zIndex: 10,
    width: 180,
  },
  nameInput: {
    width: "100%",
    padding: "6px 0px",
    marginTop: 4,
    marginBottom: 10,
    borderRadius: 5,
    border: "1px solid #ccc",
  },
  closeBtn: {
    background: "#075e54",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 5,
    cursor: "pointer",
    width: "100%",
  },
  messages: {
    flex: 1,
    padding: 15,
    overflowY: "auto",
    backgroundImage:
      "url('https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-cool-dark-green-new-theme-whatsapp.jpg')",
    backgroundSize: "cover",
  },
  message: {
    maxWidth: "70%",
    marginBottom: 10,
    padding: "8px 10px",
    borderRadius: 8,
    wordWrap: "break-word",
    fontSize: 15,
    position: "relative",
  },
  myMessage: {
    background: "#d9fdd3",
    marginLeft: "auto",
    borderBottomRightRadius: 0,
  },
  otherMessage: {
    background: "#fff",
    marginRight: "auto",
    borderBottomLeftRadius: 0,
  },
  name: {
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 3,
    color: "#075e54",
  },
  time: {
    fontSize: 11,
    color: "#777",
    textAlign: "right",
    marginTop: 3,
  },
  form: {
    display: "flex",
    padding: 10,
    borderTop: "1px solid #ddd",
    background: "#f0f2f5",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: 25,
    border: "1px solid #ccc",
    outline: "none",
  },
  sendBtn: {
    marginLeft: 8,
    padding: "10px 16px",
    borderRadius: 25,
    background: "#075e54",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};