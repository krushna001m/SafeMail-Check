// Standard RFC 5322 Raw Email Test Vectors
// These are raw RFC-compliant input streams that are processed by the real backend parser.

export const RAW_SAMPLE_VECTORS: Record<string, { name: string; description: string; raw: string }> = {
  spearphishing_credential_harvest: {
    name: 'Executive Credential Phishing',
    description: 'Spoofed CEO billing notice with DMARC fail, urgency triggers & shortener redirect',
    raw: `Delivered-To: victim.cfo@enterprise-corp.com
Received: by 2002:a05:6512:22c1:b0:538:39b0:2119 with SMTP id c1csp849122lfe;
        Sat, 22 Aug 2026 14:35:02 -0700 (PDT)
X-Google-Smtp-Source: AGHT+IF32145kldfs9923kj
X-Received: by 2002:a17:906:12cd:b0:9a2:df81:7714 with SMTP id p13mr320141ejg.12.1692739702110;
        Sat, 22 Aug 2026 14:35:01 -0700 (PDT)
ARC-Seal: i=1; a=rsa-sha256; t=1692739701; cv=none; d=google.com; s=arc-20240605;
ARC-Authentication-Results: i=1; mx.google.com;
       spf=softfail (google.com: domain of transitioning bounce@hostkey-direct.nl does not designate 185.23.44.11 as permitted sender) smtp.mailfrom=bounce@hostkey-direct.nl;
       dkim=fail (bad signature) header.i=@tracemail.ai header.s=k1 header.b=X9faB2;
       dmarc=fail (p=REJECT sp=REJECT dis=NONE) header.from=tracemail.ai
Received: from mail.bulletproof-transit.nl (mail.bulletproof-transit.nl. [185.23.44.11])
        by mx.google.com with ESMTPS id v8-20020a1709063d4800b00994511a5b88si193021ejc.31.2026.08.22.14.35.00
        for <victim.cfo@enterprise-corp.com>
        (version=TLS1_2 cipher=ECDHE-ECDSA-AES128-GCM-SHA256 bits=128/128);
        Sat, 22 Aug 2026 14:35:00 -0700 (PDT)
Received-SPF: softfail (google.com: domain of transitioning bounce@hostkey-direct.nl does not designate 185.23.44.11 as permitted sender) client-ip=185.23.44.11;
Authentication-Results: mx.google.com;
       spf=softfail (google.com: domain of transitioning bounce@hostkey-direct.nl does not designate 185.23.44.11 as permitted sender) smtp.mailfrom=bounce@hostkey-direct.nl;
       dkim=fail (bad signature) header.i=@tracemail.ai;
       dmarc=fail (p=REJECT) header.from=tracemail.ai
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=tracemail.ai; s=k1;
        t=1692739690;
        h=from:to:subject:date:message-id:mime-version:content-type;
        bh=47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=;
        b=X9faB29e84b84c8a2b0c112233445566778899aabbccddeeff00112233445566
Received: from 192.168.1.105 (c2-relay.local [10.0.0.15])
        by mail.bulletproof-transit.nl (Postfix) with ESMTPA id 4T0xK923jz
        for <victim.cfo@enterprise-corp.com>; Sat, 22 Aug 2026 21:34:50 +0000 (UTC)
From: "TraceMail Corporate Billing" <support@tracemail.ai>
Return-Path: <bounce@hostkey-direct.nl>
Reply-To: "Executive Recovery Support" <billing-dept@account-verify-portal.xyz>
To: <victim.cfo@enterprise-corp.com>
Subject: Action Required: Verify Corporate Billing Credentials Before Termination within 24 hours
Date: Sat, 22 Aug 2026 21:34:45 +0000
Message-ID: <20260822213445.4T0xK923jz@mail.bulletproof-transit.nl>
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: 7bit
X-Originating-IP: [185.23.44.11]
X-Priority: 1 (Highest)
X-Mailer: PHPMailer 6.5.0 (https://github.com/PHPMailer/PHPMailer)

<html>
<body>
<p>Dear Enterprise Administrator,</p>
<p><strong>FINAL NOTICE:</strong> We have detected irregular billing activity on your enterprise account. Your service access is scheduled to be suspended within <strong>24 hours</strong> unless credentials are confirmed.</p>
<p>Please update and re-authenticate your administrative payment profile immediately:</p>
<p><a href="http://bit.ly/secure-doc-update">http://bit.ly/secure-doc-update</a></p>
<p>Alternative backup gateway:</p>
<p><a href="http://delivery-tracking-update.xyz/c2">http://delivery-tracking-update.xyz/c2</a></p>
<p>If you have already resolved this via <a href="http://company-portal.com/login">internal SSO</a>, please notify your system officer.</p>
<br>
<p>Sincerely,<br>Global Cloud Security Operations Desk</p>
</body>
</html>`
  },

  clean_verified_newsletter: {
    name: 'Authenticated Engineering Briefing',
    description: 'Legitimate corporate notification with valid SPF, DKIM and DMARC alignment',
    raw: `Delivered-To: engineer@dev-studio.io
Received: by 2002:a05:6512:10a4:b0:538:39b0:2119 with SMTP id c4csp102934lfe;
        Sat, 22 Aug 2026 09:12:15 -0700 (PDT)
X-Google-Smtp-Source: AGHT+IF33128jklms9923kj
X-Received: by 2002:a17:906:44ed:b0:9a2:ef91:1124 with SMTP id p15mr201941ejg.14.1692720735110;
        Sat, 22 Aug 2026 09:12:14 -0700 (PDT)
ARC-Seal: i=1; a=rsa-sha256; t=1692720734; cv=none; d=google.com; s=arc-20240605;
ARC-Authentication-Results: i=1; mx.google.com;
       spf=pass (google.com: domain of bounce@updates.github.com designates 140.82.115.1 as permitted sender) smtp.mailfrom=bounce@updates.github.com;
       dkim=pass header.i=@github.com header.s=pf2024 header.b=A1bC2d;
       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=github.com
Received: from out-1.smtp.github.com (out-1.smtp.github.com. [140.82.115.1])
        by mx.google.com with ESMTPS id q19-20020a1709063d4800b00994511a5b88si110291ejc.15.2026.08.22.09.12.13
        for <engineer@dev-studio.io>
        (version=TLS1_3 cipher=TLS_AES_256_GCM_SHA384 bits=256/256);
        Sat, 22 Aug 2026 09:12:13 -0700 (PDT)
Received-SPF: pass (google.com: domain of bounce@updates.github.com designates 140.82.115.1 as permitted sender) client-ip=140.82.115.1;
Authentication-Results: mx.google.com;
       spf=pass (google.com: domain of bounce@updates.github.com designates 140.82.115.1 as permitted sender) smtp.mailfrom=bounce@updates.github.com;
       dkim=pass header.i=@github.com;
       dmarc=pass (p=REJECT) header.from=github.com
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=github.com; s=pf2024;
        t=1692720730;
        h=from:to:subject:date:message-id:mime-version:content-type;
        bh=9K2lM3nOpQrStUvWxYz0123456789abcdefABCDEF=;
        b=A1bC2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c
From: "GitHub Platform Updates" <notifications@github.com>
Return-Path: <bounce@updates.github.com>
To: <engineer@dev-studio.io>
Subject: Security Advisory & Release Notes: v2.40 Container Framework Update
Date: Sat, 22 Aug 2026 16:12:10 +0000
Message-ID: <github/updates/2026/08/release-240@github.com>
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: 7bit

<html>
<body>
<p>Hello Developer,</p>
<p>We are announcing the general availability of the new container security framework runtime.</p>
<p>Review the full changelog and release notes on GitHub Docs:</p>
<p><a href="https://docs.github.com/en/actions">https://docs.github.com/en/actions</a></p>
<p>Thank you,<br>The GitHub Team</p>
</body>
</html>`
  },

  bec_wire_fraud: {
    name: 'BEC Wire Transfer Request',
    description: 'CEO impersonation with urgent wire transfer request & free-mail return path',
    raw: `Delivered-To: accountant@target-firm.com
Received: by 2002:a05:6512:33d1:b0:538:39b0:2119 with SMTP id d9csp771239lfe;
        Sat, 22 Aug 2026 11:04:18 -0700 (PDT)
Received: from mail-relay.cheapvps-cloud.com (mail-relay.cheapvps-cloud.com. [194.26.29.88])
        by mx.google.com with ESMTPS id k4-20020a1709063d4800b00994511a5b88si883011ejc.19.2026.08.22.11.04.17
        for <accountant@target-firm.com>;
        Sat, 22 Aug 2026 11:04:17 -0700 (PDT)
Received-SPF: fail (google.com: domain of ceo-private-desk@gmail.com does not designate 194.26.29.88 as permitted sender) client-ip=194.26.29.88;
Authentication-Results: mx.google.com;
       spf=fail smtp.mailfrom=ceo-private-desk@gmail.com;
       dkim=none;
       dmarc=fail (p=NONE) header.from=target-firm.com
From: "Arthur Vance, Chief Executive Officer" <ceo@target-firm.com>
Return-Path: <ceo-private-desk@gmail.com>
Reply-To: <ceo.office.confidential.channel@mail.ru>
To: <accountant@target-firm.com>
Subject: Urgent & Confidential: Acquisition Escrow Wire Authorization Required Today
Date: Sat, 22 Aug 2026 18:04:10 +0000
Message-ID: <bec-transfer-9941@target-firm.com>
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8

Hi,

I am currently in an all-day confidential board meeting for an emergency acquisition.
I need you to process an immediate wire transfer for the initial escrow deposit ($48,500.00) before market close at 4:00 PM EST today.

Do not call my mobile as I cannot take audio calls in the boardroom. Reply directly to this email for the bank routing details.

Treat this with utmost urgency and discretion.

Best regards,
Arthur Vance
Chief Executive Officer
Target Firm Global`
  },

  simple_safe_meeting: {
    name: 'Simple Internal Team Calendar Invite',
    description: 'Benign plain-text internal correspondence with valid headers and low risk score',
    raw: `Delivered-To: bob@example.com
Received: by 2002:a05:6512:11a1:b0:538:39b0:2119 with SMTP id a1csp123456lfe;
        Sat, 22 Aug 2026 10:00:00 -0700 (PDT)
Authentication-Results: mx.example.com;
       spf=pass smtp.mailfrom=alice@example.com;
       dkim=pass header.i=@example.com;
       dmarc=pass header.from=example.com
Received-SPF: pass client-ip=198.51.100.25;
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=example.com; s=k1;
        b=ValidDKIMSignature1234567890abcdef;
From: "Alice Smith" <alice@example.com>
Return-Path: <alice@example.com>
To: <bob@example.com>
Subject: Team Sync: Project Milestone Review Tomorrow at 10 AM
Date: Sat, 22 Aug 2026 17:00:00 +0000
Message-ID: <meeting-sync-8841@example.com>
Content-Type: text/plain; charset=UTF-8

Hello Bob,

The engineering team sync is scheduled for tomorrow at 10:00 AM in Conference Room B.
Please bring your sprint summary.

Regards,
Alice`
  },

  xss_and_injection_vector: {
    name: 'Sanitization & Security Payload Vector',
    description: 'XSS, HTML tags, and SQL-like payloads to test parser resilience and UI escaping',
    raw: `Delivered-To: security-test@tracemail.ai
Received: from mail.test-sandbox.org ([203.0.113.50])
        by mx.tracemail.ai with ESMTP id xss-test-01;
        Sat, 22 Aug 2026 12:00:00 -0700
Authentication-Results: mx.tracemail.ai;
       spf=pass smtp.mailfrom=test@test-sandbox.org;
       dkim=none;
       dmarc=none
From: "<script>alert('XSS_FROM_NAME')</script>" <test@test-sandbox.org>
To: "User ' OR 1=1 --" <security-test@tracemail.ai>
Subject: Security Audit Payload: <img src=x onerror=alert('XSS_SUBJECT')> & ' OR '1'='1
Date: Sat, 22 Aug 2026 19:00:00 +0000
Message-ID: <payload-injection-999@test-sandbox.org>
Content-Type: text/html; charset=UTF-8

<html>
<body>
<h1>Test Injection Payloads</h1>
<p><script>alert('XSS_BODY_PAYLOAD')</script></p>
<p><img src="javascript:alert('XSS_IMG')"></p>
<p>SQL Probe: <code>SELECT * FROM users WHERE email='' OR '1'='1' --</code></p>
<p>Valid Link: <a href="https://example.com/safe-doc">https://example.com/safe-doc</a></p>
</body>
</html>`
  },

  multiple_urls_harvesting: {
    name: 'Multi-URL Credential Harvester',
    description: 'Email with 8 distinct URLs including direct IP, suspicious TLDs and shorteners',
    raw: `Delivered-To: analyst@enterprise.com
Received: from 185.190.140.22 ([185.190.140.22])
        by mx.enterprise.com with ESMTP id multi-url-phish;
        Sat, 22 Aug 2026 13:10:00 -0700
Authentication-Results: mx.enterprise.com;
       spf=fail;
       dkim=fail;
       dmarc=fail (p=REJECT) header.from=secure-banking-portal.top
From: "Security Operations Desk" <alerts@secure-banking-portal.top>
Return-Path: <bounce@unrelated-c2.ru>
Reply-To: <collector@direct-harvest.xyz>
To: <analyst@enterprise.com>
Subject: Immediate Action Required: 8 Accounts Scheduled for Suspension
Date: Sat, 22 Aug 2026 20:10:00 +0000
Message-ID: <multi-url-phish-441@secure-banking-portal.top>
Content-Type: text/html; charset=UTF-8

<html>
<body>
<p>Please resolve your compliance alerts using the following links:</p>
<ul>
  <li>Direct Gateway: <a href="http://198.51.100.99/auth/login">http://198.51.100.99/auth/login</a></li>
  <li>Shortener 1: <a href="http://bit.ly/bank-verify-2026">http://bit.ly/bank-verify-2026</a></li>
  <li>Shortener 2: <a href="http://tinyurl.com/sso-confirm">http://tinyurl.com/sso-confirm</a></li>
  <li>Suspicious TLD 1: <a href="http://verify-account.xyz/billing">http://verify-account.xyz/billing</a></li>
  <li>Suspicious TLD 2: <a href="http://portal-update.top/token">http://portal-update.top/token</a></li>
  <li>Suspicious TLD 3: <a href="http://account-auth.buzz/reset">http://account-auth.buzz/reset</a></li>
  <li>Legitimate Ref: <a href="https://example.com/faq">https://example.com/faq</a></li>
  <li>Duplicate Link: <a href="http://bit.ly/bank-verify-2026">http://bit.ly/bank-verify-2026</a></li>
</ul>
</body>
</html>`
  }
};
