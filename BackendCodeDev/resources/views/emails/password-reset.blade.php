<!DOCTYPE html>
<html>
<head>
    <title>CodeDev - Password Reset</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.5;
            color: #1f2937;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
        }
        .header {
            background: #1d4ed8; /* blue-700 */
            color: white;
            padding: 32px 24px;
            text-align: center;
        }
        .logo {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        .logo-icon {
            font-weight: 800;
            color: #93c5fd; /* blue-300 */
        }
        .content {
            padding: 32px 24px;
        }
        .btn {
            display: inline-block;
            background: #1d4ed8; /* blue-700 */
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            margin: 16px 0;
            transition: background-color 0.2s;
        }
        .btn:hover {
            background: #1e40af; /* blue-800 */
        }
        .code-block {
            background: #f3f4f6;
            border-radius: 6px;
            padding: 12px;
            font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
            font-size: 14px;
            margin: 16px 0;
            word-break: break-all;
            color: #1e40af; /* blue-800 */
            border-left: 3px solid #1d4ed8; /* blue-700 */
        }
        .footer {
            text-align: center;
            padding: 24px;
            font-size: 14px;
            color: #6b7280;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
        }
        .security-note {
            font-size: 13px;
            color: #6b7280;
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
        }
        .expiry {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            color: #b91c1c; /* red-700 */
            font-weight: 500;
            font-size: 14px;
        }
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 24px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span class="logo-icon">&lt;/&gt;</span> CodeDev
            </div>
            <h2 style="margin: 16px 0 0; font-weight: 600;">Reset Your Password</h2>
        </div>
        
        <div class="content">
            <p style="margin: 0 0 16px;">Hello,</p>
            
            <p style="margin: 0 0 16px;">We received a request to reset your CodeDev account password. Click the button below to proceed:</p>
            
            <div style="text-align: center; margin: 24px 0;">
                <a href="{{ $resetLink }}" class="btn">Reset Password</a>
            </div>
            
            <p style="margin: 0 0 16px;">Or copy and paste this link into your browser:</p>
            
            <div class="code-block">
                {{ $resetLink }}
            </div>
            
            <div class="divider"></div>
            
            <p style="margin: 0 0 16px;">
                <span class="expiry">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Expires in 60 minutes
                </span>
            </p>
            
            <p style="margin: 0 0 16px;">If you didn't request this password reset, please ignore this email or contact support if you have questions.</p>
            
            <div class="security-note">
                <strong>Security tip:</strong> Never share your password or this link with anyone. CodeDev support will never ask for it.
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0 0 8px;">© {{ date('Y') }} CodeDev. All rights reserved.</p>
            <p style="margin: 0 0 12px; color: #4b5563;">Empowering developers worldwide</p>
            <div style="display: flex; justify-content: center; gap: 16px;">
                <a href="#" style="color: #1d4ed8; text-decoration: none; font-size: 13px;">Help Center</a>
                <a href="#" style="color: #1d4ed8; text-decoration: none; font-size: 13px;">Privacy</a>
                <a href="#" style="color: #1d4ed8; text-decoration: none; font-size: 13px;">Terms</a>
            </div>
        </div>
    </div>
</body>
</html>