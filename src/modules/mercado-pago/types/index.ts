// Interface para mapear tipos de evento para manipuladores
export interface EventMapping {
  [eventType: string]: (eventData: any) => Promise<void>;
}

export interface Invoice {
  _id: string;
  __v: number;
  currency_id: string;
  date_created: string;
  debit_date: string;
  id: number;
  last_modified: string;
  next_retry_date: string;
  payment: {
    id: number;
    status: string;
    status_detail: string;
  };
  payment_method_id: string;
  preapproval_id: string;
  reason: string;
  retry_attempt: number;
  status: string;
  transaction_amount: number;
  type: string;
}
