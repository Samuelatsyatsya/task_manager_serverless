variable "sender_email" {
  description = "Email identity used as SES sender for notifications"
  type        = string
}

variable "recipient_emails" {
  description = "List of recipient email identities to verify for SES sandbox testing"
  type        = list(string)
  default     = []
}
