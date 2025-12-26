"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  SidebarInset,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "./sidebar"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { CardDescription, CardTitle } from "../ui/card"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  Brush,
  Camera,
  ChartBarIncreasing,
  ChevronUp,
  CircleFadingPlus,
  CircleOff,
  CircleUserRound,
  File,
  Image,
  ListFilter,
  Menu,
  MessageCircle,
  MessageSquareDashed,
  MessageSquareDot,
  Mic,
  Paperclip,
  Phone,
  Search,
  Send,
  Settings,
  Smile,
  SquarePen,
  Star,
  User,
  User2,
  UserRound,
  Users,
  Video,
} from "lucide-react"
import { supabase, type Conversation, type Message as SupabaseMessage } from "@/lib/supabase"
import { RealtimeChannel } from "@supabase/supabase-js"

interface Message {
  id: string
  content: string
  sender_type: 'customer' | 'agent' | 'system'
  created_at: string
}

// Sidebar Menu Items
const menuItems = [
  { title: "Messages", url: "#", icon: MessageCircle },
  { title: "Phone", url: "#", icon: Phone },
  { title: "Status", url: "#", icon: CircleFadingPlus },
]

export const ChatTemplate = () => {
  const { toggleSidebar } = useSidebar()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [replyText, setReplyText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // 加载会话列表
  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setConversations(data || [])
    } catch (error) {
      console.error('加载会话列表失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 加载选中会话的消息
  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('加载消息失败:', error)
    }
  }

  // 订阅实时消息更新
  useEffect(() => {
    if (!selectedConversation) return

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channel = supabase
      .channel(`agent-messages:${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          const newMessage = payload.new as SupabaseMessage
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMessage.id)) {
              return prev
            }
            return [...prev, newMessage]
          })
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [selectedConversation])

  // 订阅会话列表更新
  useEffect(() => {
    const channel = supabase
      .channel('conversations-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          loadConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setMessages([])
  }

  const handleSendReply = async () => {
    if (!selectedConversation || !replyText.trim()) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_type: 'agent',
          content: replyText.trim(),
        })

      if (error) throw error

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id)

      setReplyText('')
      loadConversations()
    } catch (error) {
      console.error('发送回复失败:', error)
    }
  }

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true
    return conv.id.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // 使用第一个会话作为默认选中
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0])
    }
  }, [conversations])

  return (
    <>
      {/* Sidebar */}
      <Sidebar variant="floating" collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigate</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={toggleSidebar} asChild>
                    <span>
                      <Menu />
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings /> Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> Manoj Rayi
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <a href="https://github.com/rayimanoj8/">Account</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Back Up</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <SidebarInset className="bg-background">
        <ResizablePanelGroup direction="horizontal" className="h-screen">
          {/* Left Panel - Chat List */}
          <ResizablePanel defaultSize={25} minSize={20} className="flex-grow">
            <div className="flex flex-col h-screen border ml-1">
              <div className="h-10 px-2 py-4 flex items-center">
                <p className="ml-1">Chats</p>
                <div className="flex justify-end w-full">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon">
                        <SquarePen />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <User /> New Contact
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users /> New Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <ListFilter />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>Filter Chats By</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <MessageSquareDot /> Unread
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Star /> Favorites
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CircleUserRound /> Contacts
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CircleOff /> Non Contacts
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <Users /> Groups
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquareDashed /> Drafts
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative px-2 py-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" />
                <Input
                  placeholder="Search or start new chat"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Contact List */}
              <ScrollArea className="flex-grow">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">加载中...</div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">暂无会话</div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`px-4 w-full py-2 hover:bg-secondary cursor-pointer text-left ${
                        selectedConversation?.id === conversation.id ? 'bg-secondary' : ''
                      }`}
                    >
                      <div className="flex flex-row gap-2">
                        <Avatar className="size-12">
                          <AvatarImage src="https://cy-747263170.imgix.net/15201ab3-e961-4298-8525-ebd51fcbefc5.png" />
                          <AvatarFallback>
                            {conversation.id.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1 min-w-0">
                          <CardTitle className="text-sm truncate">
                            {conversation.id.substring(0, 8)}...
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {conversation.status === 'active' ? '进行中' : '已关闭'}
                          </CardDescription>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel - Chat Window */}
          <ResizablePanel defaultSize={75} minSize={40}>
            {selectedConversation ? (
              <div className="flex flex-col justify-between h-screen ml-1 pb-2">
                {/* Chat Header */}
                <div className="h-16 border-b flex items-center px-3">
                  <Avatar className="size-12">
                    <AvatarImage src="https://cy-747263170.imgix.net/15201ab3-e961-4298-8525-ebd51fcbefc5.png" />
                    <AvatarFallback>
                      {selectedConversation.id.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 ml-2">
                    <CardTitle className="text-sm">
                      {selectedConversation.id.substring(0, 8)}...
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {selectedConversation.status === 'active' ? '进行中' : '已关闭'}
                    </CardDescription>
                  </div>
                  <div className="flex-grow flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Video />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Phone />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Search />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">暂无消息</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex items-end gap-3 ${
                              message.sender_type === 'agent' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {message.sender_type === 'customer' && (
                              <Avatar className="size-8">
                                <AvatarImage src="https://cy-747263170.imgix.net/15201ab3-e961-4298-8525-ebd51fcbefc5.png" />
                                <AvatarFallback className="text-xs">客</AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`max-w-[70%] rounded-xl px-4 py-3 ${
                                message.sender_type === 'agent'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs mt-2 opacity-70">
                                {new Date(message.created_at).toLocaleString('zh-CN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            {message.sender_type === 'agent' && (
                              <Avatar className="size-8">
                                <AvatarImage src="https://cy-747263170.imgix.net/EOkvsbDty0.jpg" />
                                <AvatarFallback className="text-xs">服</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>
                </ScrollArea>

                {/* Chat Input */}
                <div className="flex h-10 pt-2 border-t">
                  <Button variant="ghost" size="icon">
                    <Smile />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon">
                        <Paperclip />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Image /> Photos & Videos
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Camera /> Camera
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <File /> Document
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserRound /> Contact
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ChartBarIncreasing /> Poll
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Brush /> Drawing
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Input
                    className="flex-grow border-0"
                    placeholder="Type a message"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendReply()
                      }
                    }}
                    disabled={selectedConversation.status === 'closed'}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || selectedConversation.status === 'closed'}
                  >
                    <Send />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Mic />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">请从左侧选择一个会话</p>
                </div>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </SidebarInset>
    </>
  )
}
