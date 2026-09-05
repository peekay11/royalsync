# RoyalSync API Integration Requirements

The RoyalSync backend core is ready for provider adapters. Each provider must supply sandbox documentation and credentials before its workflow can be enabled.

## 1. Transactional email

Required capabilities:

- Send HTML/text email
- Template or raw-content support
- Delivery status webhook
- Bounce and complaint webhook
- Sender/domain verification

Provide:

- Provider name and API documentation URL
- Sandbox base URL
- Authentication method and secret name
- Send endpoint and request/response examples
- Webhook signature algorithm and example event payloads
- Verified sender address/domain

Expected adapter operation:

```text
send({ to, subject, html, text?, templateId?, variables? })
```

Used for registration, password reset, magic links, claims, renewals, payment failures, and policy notifications.

## 2. SMS and OTP

Required capabilities:

- Send SMS
- Generate or verify OTP, or confirm that RoyalSync should generate and hash OTPs
- Delivery status webhook
- International phone number support

Provide:

- Provider name and API documentation URL
- Sandbox base URL
- Authentication method and secret name
- Send endpoint and request/response examples
- OTP endpoint if provider-managed
- Delivery webhook and signature verification details
- Sender ID requirements

Expected adapter operations:

```text
send({ to, message })
sendOtp({ to, purpose })
verifyOtp({ challengeId, code })
```

## 3. WhatsApp, if required

Required capabilities:

- Template messages
- Approved template IDs
- Delivery/read/failure webhooks
- Opt-in and opt-out handling

Provide the WhatsApp Business provider, WABA details, template names, API base URL, auth method, webhook verification method, and sandbox number.

## 4. Object/file storage

Required capabilities:

- Private bucket/container
- Signed upload URLs
- Signed download URLs
- Multipart or resumable upload support
- Server-side encryption
- Object deletion/retention policy

Provide:

- Provider and region
- Bucket/container name
- Endpoint
- Access-key/secret-key or workload identity method
- Maximum file size and allowed MIME types
- Retention and lifecycle rules

Expected adapter operations:

```text
createUploadUrl({ key, contentType, size })
createDownloadUrl(key)
deleteObject(key)
```

## 5. Payments and mandates

Required capabilities:

- Create and authorize payment mandate
- Debit or collection request
- Payment status lookup
- Refund/reversal where applicable
- Signed webhooks
- Reconciliation/export

For South African debit collection, provide the exact DebiCheck/payment provider and whether the flow is API, redirect, or bank authorization.

Provide:

- Sandbox base URL
- Merchant/account identifiers
- Authentication method
- Mandate creation request/response
- Collection request/response
- Status lookup endpoint
- Webhook event types and signature rules
- Test payment instruments

Expected adapter operations:

```text
createMandate(input)
collect(input)
getPaymentStatus(id)
verifyWebhook(signature, rawBody)
```

## 6. Insurer quote/policy gateway

Required capabilities:

- Submit quote request
- Retrieve quote/status
- Receive quote webhook or poll status
- Accept/decline quote
- Incept policy
- Retrieve policy schedule/documents

For each insurer, provide:

- Insurer name and API documentation
- Sandbox base URL
- Authentication and certificate requirements
- Product identifiers
- Canonical-to-provider field mapping
- Quote request/response examples
- Error codes and retry rules
- Webhook signature details
- Rate limits and SLA

Expected adapter operations:

```text
requestQuote(application)
getQuote(requestId)
acceptQuote(quoteId)
inceptPolicy(selection)
getPolicyDocuments(policyId)
```

## 7. AI provider and document search

Required capabilities:

- Structured JSON responses
- Embeddings/vector search, or a separate vector provider
- Token/cost reporting
- Safety and data-retention controls
- Model/version selection

Provide:

- Provider and model names
- API base URL
- Authentication method
- Chat request/response example
- JSON schema or structured-output support
- Embeddings endpoint if separate
- Data-retention and PII-processing terms

Expected adapter operations:

```text
answer({ question, context, responseSchema })
embed({ text })
```

RoyalSync must query structured financial data first and use documents only for cited wording answers.

## 8. Database and infrastructure

These are not external business APIs, but production hosting also requires:

- PostgreSQL connection URL
- Migration/deployment policy
- Backup and restore policy
- Redis URL if queues, rate limits, or background jobs are distributed
- Object storage credentials
- HTTPS domain and reverse proxy
- Monitoring/error-tracking endpoint

## 9. What to provide for each provider

Send one provider at a time using this checklist:

1. Provider name.
2. Sandbox documentation URL or exported OpenAPI file.
3. Sandbox base URL.
4. Authentication method.
5. Request and response examples with secrets removed.
6. Webhook examples and signature verification rules.
7. Rate limits and retry rules.
8. Test account/instrument details.
9. Required production callback URLs.

Do not commit production secrets to the repository. Put them in the hosting platform's secret manager and provide only redacted examples here.
