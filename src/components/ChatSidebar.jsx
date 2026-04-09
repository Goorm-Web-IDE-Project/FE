import { useEffect, useRef, useState } from "react";

function ChatSidebar({ currentRoom, participants, currentUser }) {
  const [chatMessages, setChatMessages] = useState([
    {
      id: Date.now(),
      roomId: currentRoom.id,
      type: "system",
      text: `${currentUser.name}님이 입장했습니다.`,
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const [chatInput, setChatInput] = useState("");
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendChat = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage = {
      id: Date.now(),
      roomId: currentRoom.id,
      type: "message",
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: trimmed,
      createdAt: now,
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput("");
  };

  const handleChatKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  return (
    <aside className="right-sidebar">
      <div className="chat-header">
        <div className="chat-room-info">
          <div className="chat-room-name">{currentRoom.name}</div>
          <div className="chat-room-meta">
            참여자 {participants.length}명 ·{" "}
            {participants.map((p) => p.name).join(", ")}
          </div>
        </div>
      </div>

      <div className="chat-messages" ref={chatMessagesRef}>
        {chatMessages.map((message) => {
          if (message.type === "system") {
            return (
              <div key={message.id} className="chat-message system">
                <div className="chat-system-text">
                  {message.text} · {message.createdAt}
                </div>
              </div>
            );
          }

          const isMine = message.senderId === currentUser.id;

          return (
            <div
              key={message.id}
              className={`chat-message ${isMine ? "mine" : "other"}`}
            >
              {!isMine && (
                <div className="chat-message-header">
                  <span className="chat-sender">{message.senderName}</span>
                  <span className="chat-time">{message.createdAt}</span>
                </div>
              )}

              <div className="chat-message-body">
                <div className="chat-bubble">{message.text}</div>
              </div>

              {isMine && (
                <div className="chat-message-header mine-header">
                  <span className="chat-time">{message.createdAt}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="chat-input-area">
        <textarea
          className="chat-input"
          placeholder="메세지를 입력하세요"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleChatKeyDown}
        />

        <button className="chat-send-button" onClick={handleSendChat}>
          전송
        </button>
      </div>
    </aside>
  );
}

export default ChatSidebar;