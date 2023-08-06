// Interface para mapear tipos de evento para manipuladores
export interface EventMapping {
  [eventType: string]: (eventData: any) => Promise<void>;
}
