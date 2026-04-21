import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks'; 
import { Login } from './pages/Login'; 
import { Register } from './pages/Register';
import { useChat } from './hooks/useChat';
import Sidebar from './components/sidebar/Sidebar';
import ChatWindow from './components/chat/ChatWindow';
import EmptyState from './components/common/EmptyState';

const ChatDashboard = () => {
  const { conversations, activeConversation, activeMessages, selectConversation, sendMessage } = useChat();
  const realCurrentUser = useAppSelector((state) => state.auth.user);

  if (!realCurrentUser) return null; 

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900">
      <Sidebar
        conversations={conversations} 
        activeId={activeConversation?._id ?? null}
        onSelect={selectConversation}
        currentUser={realCurrentUser} 
      />

      <main className="flex-1 flex overflow-hidden">
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            messages={activeMessages}
            members={activeConversation.participants} 
            onSendMessage={sendMessage}
          />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <ChatDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}