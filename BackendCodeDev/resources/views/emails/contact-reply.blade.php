<!DOCTYPE html>
<html>
<head>
    <title>CodeDev - Response to Your Message</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 640px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(30, 41, 59, 0.08);
            border: 1px solid #e2e8f0;
        }
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 32px 20px;
            text-align: center;
            position: relative;
        }
        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .logo-brackets {
            color: #93c5fd;
            font-weight: 800;
        }
        .tagline {
            font-size: 14px;
            opacity: 0.9;
            margin-top: 4px;
        }
        .content {
            padding: 32px;
        }
        .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 28px 0;
        }
        .message-block {
            background: #f1f5f9;
            padding: 18px;
            border-radius: 6px;
            border-left: 4px solid #2563eb;
            margin: 18px 0;
            font-size: 15px;
            line-height: 1.7;
            font-family: 'Fira Code', 'Courier New', monospace;
        }
        .reply-block {
            background: #f0fdf4;
            padding: 18px;
            border-radius: 6px;
            border-left: 4px solid #10b981;
            margin: 20px 0;
            font-size: 15px;
            line-height: 1.7;
        }
        .code-tag {
            display: inline-block;
            background: #eff6ff;
            color: #2563eb;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Fira Code', monospace;
            font-size: 13px;
            margin-right: 5px;
        }
        .footer {
            text-align: center;
            padding: 24px;
            font-size: 13px;
            color: #64748b;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
        }
        .signature {
            margin-top: 28px;
            color: #475569;
        }
        .signature p {
            margin: 8px 0;
        }
        .help-list {
            padding-left: 20px;
            margin: 20px 0;
        }
        .help-list li {
            margin-bottom: 8px;
            position: relative;
            padding-left: 24px;
        }
        .help-list li:before {
            content: "→";
            color: #2563eb;
            position: absolute;
            left: 0;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span class="logo-brackets"><</span>
                CodeDev
                <span class="logo-brackets">/></span>
            </div>
            <div class="tagline">Developer Support Response</div>
            <h1>Your Message Has Been Reviewed</h1>
        </div>
        
        <div class="content">
            <p>Hello {{ $contact->name }},</p>
            
            <p>Thank you for contacting CodeDev on <span class="code-tag">{{ $contact->created_at->format('M d, Y H:i') }}</span>. Our team has reviewed your inquiry and here's what we have for you:</p>
            
            <div class="divider"></div>
            
            <h3 style="margin-top: 0; color: #1e40af; display: flex; align-items: center;">
                <span class="code-tag">Original</span> Your Message:
            </h3>
            <div class="message-block">
                {{ $contact->message }}
            </div>
            
            <h3 style="color: #047857; display: flex; align-items: center;">
                <span class="code-tag">Response</span> From Our Team:
            </h3>
            <div class="reply-block">
                {!! nl2br(e($reply)) !!}
                
                <p style="margin-top: 16px;">Need more help? Simply reply to this email.</p>
            </div>
            
            <div class="divider"></div>
            
            <p>At CodeDev, we're committed to helping you code better. Here's what you can expect:</p>
            
            <ul class="help-list">
                <li>Quick responses from our developer support team</li>
                <li>Technical expertise from active coders</li>
                <li>Personalized solutions for your projects</li>
                <li>Code reviews and best practice advice</li>
            </ul>
            
            <div class="signature">
                <p>Happy coding,</p>
                <p><strong>The CodeDev Team</strong></p>
                <p>📍 Virtual Developer Hub</p>
                <p>🌐 <a href="https://CodeDev.com" style="color: #2563eb; text-decoration: none;">CodeDev.com</a></p>
                <p style="margin-top: 16px; font-size: 12px; color: #64748b;">
                    Ticket ID: <span style="font-family: 'Fira Code', monospace;">#{{ substr(md5($contact->id), 0, 8) }}</span>
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p>© {{ date('Y') }} <span class="logo-brackets"><</span>CodeDev<span class="logo-brackets">/></span>. All rights reserved.</p>
            <p>Empowering developers worldwide</p>
            <p>
                <a href="https://CodeDev.com/docs" style="color: #2563eb; text-decoration: none; margin: 0 8px;">Docs</a> • 
                <a href="https://CodeDev.com/community" style="color: #2563eb; text-decoration: none; margin: 0 8px;">Community</a> • 
                <a href="https://CodeDev.com/blog" style="color: #2563eb; text-decoration: none; margin: 0 8px;">Blog</a>
            </p>
            <p style="font-size: 12px; margin-top: 12px;">Didn't contact us? <a href="mailto:security@CodeDev.com" style="color: #dc2626;">Report this</a></p>
        </div>
    </div>
</body>
</html>