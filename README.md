# DevOps_AutoOps

**Team Members:**
- Ashwinkumar Manickam Vaithiyanathan - amanick  
- Jaya Shruti Chintalapati - jchinta  
- Bharadwaj Katna - bkatna
  
---

## PROPOSAL

The DevOps problem we aim to solve is the integration and deployment of unvalidated code into production, leading to unreliable pipelines. In many CI/CD setups, new builds are released into production environments without adequate validation, pre deployment testing or continuous monitoring aligned with meaningful performance indicators. Undetected errors pass to later stages, resulting in failed deployments, broken integrations, and increased recovery time. When pipelines lack integrated security, validation, and meaningful observability, they often allow failures to go unnoticed until they affect end users. This results in slower delivery cycles, higher failure rates, and diminished confidence. Although automation exists, it would operate in a risk prone environment. This problem impacts every layer of the DevOps developers who lose time debugging failed deployments, operations teams face emergency fixes, end users experience downtime or broken functionality, and organizations lose confidence in continuous delivery, slowing overall innovation.

Our pipeline automates the entire software delivery lifecycle, from code integration to deployment and runtime evaluation. It ensures consistent code quality and reliability. The pipeline builds and deploys a dark launch of the application alongside the active production instance, where synthetic API calls are used to simulate user activity and validate functionality and performance. If the monitored metrics meet the defined thresholds, the new version is automatically promoted to production. Once deployed, the monitoring system continuously evaluates the production environment and initiates recovery workflows whenever thresholds are breached. This enables automatic rollback to the last stable build, restoring service health without any manual effort. Overall, the pipeline creates a continuous loop detecting issues early, validating releases safely, and recovering from failures autonomously. The pipeline does not have direct user interaction. It responds automatically to events in the CI/CD flow. Validation is performed through synthetic API calls that simulate user traffic to the dark launch environment, so only developers and the automated system interact with the pipeline, not end users.

**Tagline:**  
AutoOps: Autonomous, Self-Healing Pipelines for Reliable Deployment and Recovery

---

## Use Case

Together, these two use cases form the complete DevOps automation cycle.

### Use Case: PR to release branch triggers dark-launch deployment and validation

**1 Preconditions**
- Deployment VM provisioned and secured via Tailscale.  
- GitHub Actions workflow configured with CI/CD pipeline.  
- Prometheus, Grafana, and Icinga containers running.  
- A release branch exists in the repository.

**2 Main Flow**
[S1] Developer opens a Pull Request to the release branch.  
[S2] GitHub Actions runs linting, static analysis, and unit/integration tests.  
[S3] GitHub Actions builds a Docker image tagged as ‘dark’ and ‘vX.Y.Z’.  
[S4] Ansible deploys the dark container on port :8082 while the current production container continues on port :8080.  
[S5] Synthetic traffic generator sends API requests to ‘/health’ and ‘/predict’ endpoints of the dark container.  
[S6] Monitoring tool collects metrics (error rate, latency) via REST API.  
[S7] Monitoring tool evaluates the metrics.  
[S8] Ansible promotes the new image to production.  
[S9] GitHub Actions posts deployment results as comments to the PR.  

**3 Subflows**
[S1] PR must be approved by the Release Engineer (branch protection).  
[S5] Synthetic traffic script runs automatically after deployment to validate dark launch.  
[S7] Monitoring tool evaluate metrics with thresholds (e.g., error rate < 5%, latency < 500ms)  

**4 Alternative Flows**
[E1] Linting or tests fail, pipeline terminates; no deployment.  
[E2] Dark container fails health check, rollback playbook removes the container; production remains on old version.  
[E3] When metrics are not met, rollback playbooks are triggered to remove the dark container.  
[E4] VM unreachable, GitHub Actions posts failure message; no promotion occurs.

---

### Use Case: Runtime Monitoring and Self-Healing Response

**1 Preconditions**
- Production container (vX.Y.Z) is running on port :8080 after a successful promotion.  
- Monitoring and alerting rules are configured for uptime, latency, and error rate.  
- The monitoring system is connected to the automation workflow so recovery actions can run automatically when alerts are triggered.

**2 Main Flow**
[S1] The production service operates under continuous monitoring.  
[S2] The monitoring system collects operational metrics such as availability, latency, error rate, and resource usage at defined intervals.  
[S3] Metrics remain within acceptable thresholds, confirming stable system performance.  
[S4] Dashboards display healthy status, indicating that no anomalies are detected.  
[S5] The service continues normal operation without requiring manual intervention.

**3 Subflows**
[S2] Metrics are evaluated periodically (for example, every 30 seconds).  
[S3] Alert rules are continuously validated against threshold definitions.  
[S5] Monitoring data and health summaries are logged for reporting and audit purposes.

**4 Alternative Flows**
[E1] A monitored metric exceeds its threshold (e.g., latency > 500 ms or error rate > 5%).  
[E2] An alert is generated and sent to the automation pipeline.  
[E3] The automation system executes the recovery script to restore service stability.  
[E4] The recovery workflow stops the affected instance and redeploys the last stable version (vX.Y.Y).  
[E5] The monitoring system verifies that the service health has been restored and records the recovery event.

---

## Guidelines
The overall guideline is to maintain simplicity, transparency, and modular automation so the system can be easily audited, extended, and reproduced without external dependencies or paid services.

---

## Pipeline Design

![Pipeline Design](https://drive.google.com/file/d/1oqcqdgeXJXHdy_2PoQghjYAkyG7Lmog4/view?usp=sharing)

**Note:** The tools and configurations subject to refinement. The current setup demonstrates core functionality, while final tool selection and integration will evolve as the project progresses.

### Architecture Components
The developer pushes the code, and opens a PR to the release branch which triggers the GitHub actions. The GitHub Actions runs linting and tests. Once it is passed, a docker image is created with the dark tag and version number tagged as it will undergo a dark launch in a dedicated port. Then the ansible playbook is triggered with the already provisioned VM, and synthetic API calls are made to the app deployed through docker which will test the new feature functionality and validates through the defined threshold metrics from the prometheus monitoring metrics and Icinga health checks. If it succeeds then the dark launch is promoted to production port. If the health checks are failing[like Application Crash, Health Endpoint returns 500, Latency issues], then the ansible rollback yml file is triggered. Also if the dark launching is passed and promoted to the production, if there are any runtime errors like [Database Migration Error, Disk Usage Threshold Exceeded, Container OOM Kill], using the prometheus metrics and alerts the rollback is again triggered and the healthy old version of docker is restored with near zero downtime.
