export const CHAT_OPEN_EVENT = 'ps-chat-open'

export function openChatDrawer(): void {
  if (typeof document === 'undefined') return
  document.body.classList.add('chat-open')
  document.dispatchEvent(new CustomEvent(CHAT_OPEN_EVENT))
}

export function closeChatDrawer(): void {
  if (typeof document === 'undefined') return
  document.body.classList.remove('chat-open')
}
