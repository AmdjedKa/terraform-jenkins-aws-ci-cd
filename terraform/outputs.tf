# Output the EC2 Public IP
output "jenkins_ec2_instance_public_ip" {
  value = "✅ ${aws_instance.jenkins.public_ip}:8080"
}

# Output a command to retrieve the Jenkins initial password
output "jenkins_initial_password_command" {
  value = "\n✅ Execute this command to get jenkins initial password:\n➥  ssh -i ./key.pem ubuntu@${aws_instance.jenkins.public_ip} 'sudo cat /var/lib/jenkins/secrets/initialAdminPassword'\n"
}