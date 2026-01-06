export interface CreateCommentPayload {
  ticketId: number;
  userId: number;
  comment: string;
}

export interface UpdateCommentPayload {
  comment: string;
}
