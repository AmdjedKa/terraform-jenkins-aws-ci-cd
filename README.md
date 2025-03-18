### README

# **Terraform-Jenkins CI/CD for AWS Microservices**
This project implements a complete CI/CD pipeline using **Terraform**, **AWS**, and **Jenkins** to automate the building and the deployment of microservices.


## **Features**
- **Infrastructure as Code**: Provision and manage cloud resources with Terraform.
- **AWS Integration**: Seamless integration with AWS services (EC2, ECR, RDS, etc.).
   - *Note*: This project is configured for AWS Academy Learner Lab; a production account would require some configuration adjustments.
- **Kubernetes Orchestration**: Deploy services to AWS Elastic Kubernetes Service.
- **CI/CD Pipeline**: Fully automated build and deployment pipeline in Jenkins.
- **GitHub Webhook Integration**: Automatically trigger the Jenkins pipeline upon a GitHub push for automated builds.
- **Monitoring and Observability**: Integrated Prometheus for metrics collection and Grafana for data visualization and dashboarding.


## **Setup Instructions**

### **Prerequisites**
- AWS academy account with AWS Learner Lab access
- AWS CLI installed
- Terraform installed
- GitHub repository

### **Deployment Steps**

#### **❶ Configure AWS CLI**
   Run the following commands to set up AWS CLI authentication:

   (credentials available in the `AWS academy Learner Lab launch page` > `AWS details`)

   ```sh
   aws configure
   aws configure set aws_session_token <SESSION_TOKEN>
   ```

#### **❷ Create a Key Pair**
   Generate an SSH key pair from the `AWS console` and place it in the `terraform` folder:
   - **name**: key
   - **type**: RSA
   - **file format**: .pem

#### **❸ Deploy Infrastructure with Terraform**
01. Create a `terraform.tfvars` file that has the following variables: **aws_account_id**, **database_password** & **jwt_secret** and place it inside the `terraform` folder. It should look something like this:
      ```ini
      aws_account_id = "851725608377"
      database_password = "password"
      jwt_secret = "ObniQRDxKf+gKwKfJq3FDuYd1FWnVptFaClC0XkHaqo="  # Base64 encoded string
      ```

02. Initialize Terraform and apply the configuration:
      ```sh
      terraform init
      terraform apply --auto-approve
      ```

03. Once completed, execute the command in the output to get jenkin's initial password.

#### **❹ Set Up GitHub Webhook**
In the GitHub repository:

01. Navigate to `Settings` > `Webhooks` > `Add webhook`
02. Configure the webhook with:
      - **Payload URL**: http://<Jenkins_URL>/github-webhook/
      - **Content type**: application/json
      - **Events**: Just the push event

#### **❺ Configure Jenkins**
   - **Add AWS Credentials**:

      In **Jenkins**, navigate to `Manage Jenkins` > `Credentials` > `System` > `Global credentials` and add the following **Secret text** credentials:

      - aws_account_id
      - aws_access_key_id
      - aws_secret_access_key
      - aws_session_token

   - **Create a pipeline to build and deploy**:<br><br>
       1\. Go to `Jenkins Dashboard` > `New Item` > `Pipeline`<br>
      2\. Under `Build Triggers`, select **GitHub hook trigger for GITScm polling**<br>
      3\. Under `Pipeline`, set:<br>
      - **Definition**: Pipeline script from SCM
      - **SCM**: Git
      - **Repository URL**: \<GitHub Repo URL\>
      - **Branch Specifier**: */main
      - **Script path**: build-and-deploy

      4\. Click on `Save` then `Build Now`<br>
      5\. Once the build is finished, you can access the website by clicking on the `build` > `Console Output` > Scroll to the bottom to get the **ingress url**.<br>

   - **Create a pipeline to configure monitoring**:

      Same steps as the previous pipeline except:

      - **Don't** select GitHub hook trigger for GITScm polling.
      - **Script path**: configure-monitoring


#### **❻ Configure Prometheus & Grafana:**
   Open the Grafana URL displayed in the configure-monitoring pipeline build's `Console Output`:
   01. Login
   02. In the header click `+` > `Import dashboard`:
      - **Grafana.com dashboard url or id**: 1860 then click `Load`
      - **Prometheus Data Source**: Select `Prometheus`
      - Click `Import`

## **Usage**

After everything is set up:

   - The webhook triggers Jenkins to build and deploy the services automatically once code is pushed to the `main` branch in the GitHub repository.

   - Prometheus collects and stores metrics from the Kubernetes cluster. Grafana provides real-time monitoring dashboards.


## **License**

This project is licensed under the MIT License.