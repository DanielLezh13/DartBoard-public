import ChatPage from "./chat/page";
import { ChatRouteKeyWrapper } from "@/components/ChatRouteKeyWrapper";

export default function Page() {
  return (
    <ChatRouteKeyWrapper>
      <ChatPage />
    </ChatRouteKeyWrapper>
  );
}
