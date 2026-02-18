export interface Machinery {
  id: string
  name: string
  type: string
  location: string
  status: "operational" | "maintenance" | "warning" | "offline"
  installation_date: string
  last_maintenance: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface MaintenanceOrder {
  id: string
  machinery_id: string
  title: string
  type: "preventivo" | "correctivo"
  priority: "baja" | "media" | "alta" | "critica"
  status: "pendiente" | "en_progreso" | "completada" | "cancelada"
  description: string | null
  assigned_to: string | null
  scheduled_date: string | null
  completed_at: string | null
  cost: number | null
  created_at: string
  updated_at: string
  machinery?: Machinery
}

export interface Sensor {
  id: string
  machinery_id: string
  name: string
  sensor_type: string
  unit: string
  threshold_min: number | null
  threshold_max: number | null
  status: string
  created_at: string
  updated_at: string
  machinery?: Machinery
}

export interface SensorReading {
  id: string
  sensor_id: string
  value: number
  status: "normal" | "warning" | "critical"
  timestamp: string
  sensor?: Sensor
}

export interface Alert {
  id: string
  sensor_id: string | null
  machinery_id: string
  alert_type: string
  severity: "info" | "warning" | "critical"
  message: string
  status: "active" | "acknowledged" | "resolved"
  resolved_at: string | null
  created_at: string
  machinery?: Machinery
  sensor?: Sensor
}

export interface MaintenanceHistory {
  id: string
  machinery_id: string
  order_id: string | null
  performed_by: string | null
  description: string
  date: string
  cost: number | null
  parts_replaced: string | null
  notes: string | null
  machinery?: Machinery
}

// Chat System Types
export interface UserProfile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  status: 'online' | 'offline' | 'away'
  last_seen: string
  created_at: string
  updated_at: string
}

export interface UserContact {
  id: string
  user_id: string
  contact_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  updated_at: string
  contact?: UserProfile
}

export interface Conversation {
  id: string
  created_at: string
  updated_at: string
  participants?: ConversationParticipant[]
  last_message?: Message
  unread_count?: number
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  joined_at: string
  last_read_at: string
  user?: UserProfile
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'system'
  status: 'sent' | 'delivered' | 'read'
  reply_to: string | null
  created_at: string
  expires_at: string
  deleted_at: string | null
  sender?: UserProfile
  attachments?: MessageAttachment[]
}

export interface MessageAttachment {
  id: string
  message_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  created_at: string
}
