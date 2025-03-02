# Output the EC2 Public IP
output "jenkins_public_ip" {
  value = aws_instance.jenkins.public_ip
}

# Output a command to retrieve the Jenkins initial password
output "jenkins_initial_password_command" {
  value = "\nExecute this command to get the jenkins initial password:\n> ssh -i ./key.pem ubuntu@${aws_instance.jenkins.public_ip} 'sudo cat /var/lib/jenkins/secrets/initialAdminPassword'"
}