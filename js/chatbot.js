// ================================================
// 🤖 AI Chatbot Module (Val.town + Gemini API)
// ================================================

import { state } from './state.js';

export function toggleChat() {
  const box = document.getElementById('chat-box');
  if (!box) return;
  box.style.display = box.style.display === 'none' ? 'flex' : 'none';
  if (box.style.display === 'flex') {
    box.style.flexDirection = 'column';
    document.getElementById('chat-input')?.focus();
  }
}

export async function sendChat() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;

  input.value = '';
  appendChatMsg(msg, 'user');

  const endpoint = state.settings.chatbotEndpoint;
  if (!endpoint) {
    appendChatMsg('مساعد الديب غير متاح حالياً. تواصل معنا على واتساب! 📱', 'bot');
    return;
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, store: 'ELDEEB STORE' })
    });
    const data = await res.json();
    appendChatMsg(data.reply || data.message || 'عذراً، لم أفهم سؤالك. تواصل معنا مباشرة!', 'bot');
  } catch(e) {
    appendChatMsg('حدث خطأ في الاتصال. جرب لاحقاً! 😊', 'bot');
  }
}

export function appendChatMsg(text, sender) {
  const msgs = document.getElementById('chat-messages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = `chat-msg ${sender}`;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

window.toggleChat = toggleChat;
window.sendChat = sendChat;
