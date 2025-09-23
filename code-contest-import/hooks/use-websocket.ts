"use client"

import { useEffect, useRef, useState } from "react"

interface UseWebSocketOptions {
  onMessage?: (data: any) => void
  onConnect?: () => void
  onDisconnect?: () => void
  reconnectInterval?: number
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  const { onMessage, onConnect, onDisconnect, reconnectInterval = 3000 } = options

  const connect = () => {
    try {
      wsRef.current = new WebSocket(url)

      wsRef.current.onopen = () => {
        setIsConnected(true)
        onConnect?.()
        console.log("[v0] WebSocket connected")
      }

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setLastMessage(data)
        onMessage?.(data)
      }

      wsRef.current.onclose = () => {
        setIsConnected(false)
        onDisconnect?.()
        console.log("[v0] WebSocket disconnected, attempting to reconnect...")

        // Attempt to reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, reconnectInterval)
      }

      wsRef.current.onerror = (error) => {
        console.error("[v0] WebSocket error:", error)
      }
    } catch (error) {
      console.error("[v0] Failed to connect WebSocket:", error)
    }
  }

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    wsRef.current?.close()
  }

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [url])

  return {
    isConnected,
    lastMessage,
    sendMessage,
    disconnect,
  }
}
