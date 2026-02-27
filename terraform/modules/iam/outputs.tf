output "lambda_role_arn" {
  description = "Lambda execution role ARN"
  value       = aws_iam_role.lambda_execution.arn
}

output "lambda_role_name" {
  description = "Lambda execution role name"
  value       = aws_iam_role.lambda_execution.name
}

# output "api_gateway_role_arn" {
#   description = "API Gateway CloudWatch role ARN"
#   value       = aws_iam_role.api_gateway_cloudwatch.arn
# }
