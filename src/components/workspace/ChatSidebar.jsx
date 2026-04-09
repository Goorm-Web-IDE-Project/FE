import { useEffect, useRef, useState } from "react";
import useAuthStore from "../../store/authStore";
import useChatStore from "../../store/chatStore";

function ChatSidebar() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const currentRoom = useChatStore((state) => state.currentRoom);
  const participants = useChatStore((state) => state.participants);
  const chatMessages = useChatStore((state) => state.chatMessages);
  const sendMessage = useChatStore((state) => state.sendMessage);

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

    sendMessage(trimmed, currentUser);
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