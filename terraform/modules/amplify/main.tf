resource "aws_amplify_app" "main" {
  name       = var.app_name
  repository = var.repository

  access_token = var.access_token

  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - cd frontend                  
            - rm -rf node_modules package-lock.json    
            - npm install 
        build:
          commands:
            - npm run build                  # Build from frontend/
      artifacts:
        baseDirectory: frontend/build        # Output is in frontend/build
        files:
          - '**/*'
      cache:
        paths:
          - frontend/node_modules/**/*       # Cache frontend dependencies
  EOT

  environment_variables = {
    REACT_APP_AWS_REGION          = var.aws_region
    REACT_APP_USER_POOL_ID        = var.cognito_user_pool_id
    REACT_APP_USER_POOL_CLIENT_ID = var.cognito_client_id
    REACT_APP_API_ENDPOINT        = var.api_gateway_endpoint
  }

  custom_rule {
    source = "/<*>"
    status = "404"
    target = "/index.html"
  }

  tags = {
    Name = var.app_name
  }
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.main.id
  branch_name = var.branch

  enable_auto_build = true

  framework = "React"
  stage     = "PRODUCTION"
}

resource "aws_amplify_webhook" "main" {
  app_id      = aws_amplify_app.main.id
  branch_name = aws_amplify_branch.main.branch_name
  description = "Trigger build on push"
}
