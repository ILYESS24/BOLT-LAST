import { useState } from "react";
import { useAtom } from "jotai";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Plus, MessageSquare, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { selectedChatIdAtom } from "@/atoms/chatAtoms";
import { selectedAppIdAtom } from "@/atoms/appAtoms";
import { dropdownOpenAtom } from "@/atoms/uiAtoms";
import { IpcClient } from "@/ipc/ipc_client";
import { showError, showSuccess } from "@/lib/toast";
import {
  SidebarContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChats } from "@/hooks/useChats";
import { RenameChatDialog } from "./chat/RenameChatDialog";
import { DeleteChatDialog } from "./chat/DeleteChatDialog";

export function ChatList({ show: _show }: { show?: boolean }) {
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useAtom(selectedChatIdAtom);
  const [selectedAppId, setSelectedAppId] = useAtom(selectedAppIdAtom);
  const [, setIsDropdownOpen] = useAtom(dropdownOpenAtom);
  const { chats, loading, refreshChats } = useChats(selectedAppId ? parseInt(selectedAppId) : null);
  const _routerState = useRouterState();
  // const isChatRoute = routerState.location.pathname === "/chat";

  // Rename dialog state
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameChatId, setRenameChatId] = useState<number | null>(null);
  const [renameChatTitle, setRenameChatTitle] = useState("");

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteChatId, setDeleteChatId] = useState<number | null>(null);
  const [deleteChatTitle, setDeleteChatTitle] = useState("");

  const handleChatClick = ({
    chatId,
    appId,
  }: {
    chatId: number;
    appId: number;
  }) => {
    setSelectedChatId(chatId.toString());
    setSelectedAppId(appId.toString());
    navigate({
      to: "/chat",
      search: { id: chatId },
    });
  };

  const handleNewChat = async () => {
    // Only create a new chat if an app is selected
    if (selectedAppId) {
      try {
        // Create a new chat with an empty title for now
        const chatId = await IpcClient.getInstance().createAppChat(selectedAppId);

        // Navigate to the new chat
        setSelectedChatId(chatId);
        navigate({
          to: "/chat",
          search: { id: chatId },
        });

        // Refresh the chat list
        await refreshChats();
      } catch (error) {
        console.error("Error creating new chat:", error);
        showError("Failed to create new chat");
      }
    }
  };

  const handleDeleteChat = async (chatId: number) => {
    try {
      await IpcClient.getInstance().deleteAppChat(chatId.toString());
      showSuccess("Chat deleted successfully");

      // If the deleted chat was selected, navigate to home
      if (selectedChatId === chatId.toString()) {
        setSelectedChatId(null);
        navigate({ to: "/chat" });
      }

      // Refresh the chat list
      await refreshChats();
    } catch (error) {
      console.error("Error deleting chat:", error);
      showError("Failed to delete chat");
    }
  };

  const handleRenameChat = (chatId: number, currentTitle: string) => {
    setRenameChatId(chatId);
    setRenameChatTitle(currentTitle);
    setIsRenameDialogOpen(true);
  };

  const handleDeleteChatClick = (chatId: number, chatTitle: string) => {
    setDeleteChatId(chatId);
    setDeleteChatTitle(chatTitle);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteChatId) {
      await handleDeleteChat(deleteChatId);
      setIsDeleteDialogOpen(false);
      setDeleteChatId(null);
      setDeleteChatTitle("");
    }
  };

  const handleRenameDialogClose = (open: boolean) => {
    setIsRenameDialogOpen(open);
    if (!open) {
      setRenameChatId(null);
      setRenameChatTitle("");
    }
  };

  return (
    <SidebarContent className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Chats</h2>
        <Button
          onClick={handleNewChat}
          size="sm"
          variant="outline"
          disabled={!selectedAppId}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent Chats</h3>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs">Start a conversation to see your chats here</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div key={chat.id} className="relative">
                  <Button
                    variant="ghost"
                    onClick={() =>
                      handleChatClick({
                        chatId: typeof chat.id === 'string' ? parseInt(chat.id) : chat.id,
                        appId: chat.appId,
                      })
                    }
                    className={`justify-start w-full text-left py-3 pr-1 hover:bg-sidebar-accent/80 ${
                      selectedChatId === chat.id.toString()
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col w-full">
                      <span className="text-sm font-medium truncate">
                        {chat.name || "Untitled Chat"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {chat.lastMessage
                          ? chat.lastMessage.substring(0, 50) +
                            (chat.lastMessage.length > 50 ? "..." : "")
                          : "No messages yet"}
                      </span>
                    </div>
                  </Button>

                  {selectedChatId === chat.id.toString() && (
                    <DropdownMenu
                      modal={false}
                      onOpenChange={(open) => setIsDropdownOpen(open)}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-sidebar-accent/80"
                        >
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleRenameChat(typeof chat.id === 'string' ? parseInt(chat.id) : chat.id, chat.name || "")}
                        >
                          <Edit size={14} className="mr-2" />
                          <span>Rename Chat</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteChatClick(typeof chat.id === 'string' ? parseInt(chat.id) : chat.id, chat.name || "New Chat")}
                          className="text-red-600"
                        >
                          <Trash2 size={14} className="mr-2" />
                          <span>Delete Chat</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rename Chat Dialog */}
      {renameChatId !== null && (
        <RenameChatDialog
          chatId={renameChatId}
          currentTitle={renameChatTitle}
          isOpen={isRenameDialogOpen}
          onOpenChange={handleRenameDialogClose}
          onRename={refreshChats}
        />
      )}

      {/* Delete Chat Dialog */}
      <DeleteChatDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={handleConfirmDelete}
        chatTitle={deleteChatTitle}
      />
    </SidebarContent>
  );
}