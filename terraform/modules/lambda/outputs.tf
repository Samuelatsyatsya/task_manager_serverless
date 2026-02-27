output "create_task_function_name" {
  description = "Create task Lambda function name"
  value       = aws_lambda_function.create_task.function_name
}

output "create_task_invoke_arn" {
  description = "Create task Lambda invoke ARN"
  value       = aws_lambda_function.create_task.invoke_arn
}

output "update_task_function_name" {
  description = "Update task Lambda function name"
  value       = aws_lambda_function.update_task.function_name
}

output "update_task_invoke_arn" {
  description = "Update task Lambda invoke ARN"
  value       = aws_lambda_function.update_task.invoke_arn
}

output "update_status_function_name" {
  description = "Update status Lambda function name"
  value       = aws_lambda_function.update_status.function_name
}

output "update_status_invoke_arn" {
  description = "Update status Lambda invoke ARN"
  value       = aws_lambda_function.update_status.invoke_arn
}

output "get_tasks_function_name" {
  description = "Get tasks Lambda function name"
  value       = aws_lambda_function.get_tasks.function_name
}

output "get_tasks_invoke_arn" {
  description = "Get tasks Lambda invoke ARN"
  value       = aws_lambda_function.get_tasks.invoke_arn
}

output "assign_task_function_name" {
  description = "Assign task Lambda function name"
  value       = aws_lambda_function.assign_task.function_name
}

output "assign_task_invoke_arn" {
  description = "Assign task Lambda invoke ARN"
  value       = aws_lambda_function.assign_task.invoke_arn
}

output "close_task_function_name" {
  description = "Close task Lambda function name"
  value       = aws_lambda_function.close_task.function_name
}

output "close_task_invoke_arn" {
  description = "Close task Lambda invoke ARN"
  value       = aws_lambda_function.close_task.invoke_arn
}

output "get_users_invoke_arn" {
  value = aws_lambda_function.get_users.invoke_arn
}

output "get_users_function_name" {
  value = aws_lambda_function.get_users.function_name
}

output "notify_handler_function_name" {
  value = aws_lambda_function.notify_handler.function_name
}

output "email_dispatcher_function_name" {
  value = aws_lambda_function.email_dispatcher.function_name
}
