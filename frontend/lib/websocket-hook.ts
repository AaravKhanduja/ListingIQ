// frontend/lib/websocket-hook.ts

import { useEffect, useRef, useState, useCallback } from 'react';

export interface JobUpdate {
  type: 'job_update' | 'error';
  job_id: string;
  data?: {
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    current_section: string | null;
    results: Record<string, unknown>;
    error_message: string | null;
    updated_at: string;
  };
  message?: string;
}

export interface UseWebSocketOptions {
  userId: string;
  onJobUpdate?: (update: JobUpdate) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const { userId, onJobUpdate, onError, onConnect, onDisconnect } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/analysis/${userId}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data: JobUpdate = JSON.parse(event.data);
          onJobUpdate?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          onError?.('Failed to parse server message');
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        onDisconnect?.();

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          reconnectAttempts.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`);
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionError('Failed to reconnect after multiple attempts');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('WebSocket connection error');
        onError?.('WebSocket connection error');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create WebSocket connection');
      onError?.('Failed to create WebSocket connection');
    }
  }, [userId, onJobUpdate, onError, onConnect, onDisconnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const subscribeToJob = useCallback((jobId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe_job',
        job_id: jobId
      }));
    }
  }, []);

  const unsubscribeFromJob = useCallback((jobId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe_job',
        job_id: jobId
      }));
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    subscribeToJob,
    unsubscribeFromJob,
  };
}

// Hook for managing async analysis jobs
export function useAsyncAnalysis() {
  const [currentJob, setCurrentJob] = useState<{
    jobId: string | null;
    status: string | null;
    progress: number;
    currentSection: string | null;
    results: Record<string, unknown>;
    error: string | null;
  }>({
    jobId: null,
    status: null,
    progress: 0,
    currentSection: null,
    results: {},
    error: null,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const startAnalysis = useCallback(async (
    propertyAddress: string,
    propertyTitle: string,
    manualData?: Record<string, unknown>,
    userToken?: string
  ) => {
    if (!userToken) {
      throw new Error('Authentication token required');
    }

    try {
      setIsAnalyzing(true);
      setCurrentJob({
        jobId: null,
        status: null,
        progress: 0,
        currentSection: null,
        results: {},
        error: null,
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/analysis/async`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          property_address: propertyAddress,
          property_title: propertyTitle,
          manual_data: manualData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCurrentJob(prev => ({
          ...prev,
          jobId: data.job_id,
          status: 'pending',
        }));
        return data.job_id;
      } else {
        throw new Error(data.error || 'Failed to start analysis');
      }
    } catch (error) {
      setCurrentJob(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
      setIsAnalyzing(false);
      throw error;
    }
  }, []);

  const cancelAnalysis = useCallback(async (jobId: string, userToken: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/analysis/job/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel analysis: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCurrentJob(prev => ({
          ...prev,
          status: 'cancelled',
        }));
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error('Error cancelling analysis:', error);
    }
  }, []);

  const handleJobUpdate = useCallback((update: JobUpdate) => {
    if (update.type === 'job_update' && update.data) {
      setCurrentJob(prev => ({
        ...prev,
        status: update.data!.status,
        progress: update.data!.progress,
        currentSection: update.data!.current_section,
        results: update.data!.results,
        error: update.data!.error_message,
      }));

      if (update.data.status === 'completed' || update.data.status === 'failed' || update.data.status === 'cancelled') {
        setIsAnalyzing(false);
      }
    } else if (update.type === 'error') {
      setCurrentJob(prev => ({
        ...prev,
        error: update.message || 'Unknown error',
      }));
      setIsAnalyzing(false);
    }
  }, []);

  return {
    currentJob,
    isAnalyzing,
    startAnalysis,
    cancelAnalysis,
    handleJobUpdate,
  };
}
