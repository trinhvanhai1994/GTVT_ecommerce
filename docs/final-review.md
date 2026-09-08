# Final review

## Architecture
Đúng microservices + Gateway + Eureka (opt-in) + DB per service + RabbitMQ.

## Business
Golden Path và Failure Path khớp BPMN/API/code.

## Database
7 logical PostgreSQL databases; no cross-service FK.

## Security
JWT + BCrypt + roles; password not returned.

## Messaging
Order publishes after commit; notification consumes independently.

## Transaction
Saga orchestration in Order Service with inventory release compensation.

## Code
No critical TODOs on core checkout path.

## Testing
JUnit/MockMvc + `scripts/e2e-verify.ps1` against live Gateway.

## Deployment
docker-compose includes RabbitMQ and all apps; local Postgres.

## Documentation
docs/01–14, ADRs, diagrams, demo, defense, this review.
