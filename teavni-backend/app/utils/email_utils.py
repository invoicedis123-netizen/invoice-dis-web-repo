import smtplib
from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def send_email(
    subject: str,
    body: str,
    to_email: str,
    cc_email: Optional[str] = None,
    from_name: str = "TEVANI Invoice Financing"
):
    """
    Send an email using SMTP
    
    Args:
        subject: Email subject
        body: Email body (HTML)
        to_email: Recipient email address
        cc_email: CC email address (optional)
        from_name: Sender name (optional)
    
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    # Check if email sending is enabled
    if not settings.EMAIL_SENDING_ENABLED:
        logger.info(f"Email sending is disabled. Would have sent to {to_email} with subject '{subject}'")
        return True
    
    # Check if email password is set
    if not settings.EMAIL_PASSWORD:
        logger.warning("Email password not set. Please set EMAIL_PASSWORD environment variable.")
        return False
    
    try:
        # Create message
        message = MIMEMultipart()
        message["From"] = f"{from_name} <{settings.EMAIL_USERNAME}>"
        message["To"] = to_email
        message["Subject"] = subject
        
        if cc_email:
            message["Cc"] = cc_email
        
        # Attach body
        message.attach(MIMEText(body, "html"))
        
        # Connect to SMTP server
        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            if settings.EMAIL_USE_TLS:
                server.starttls()
            
            # Login
            server.login(settings.EMAIL_USERNAME, settings.EMAIL_PASSWORD)
            
            # Send email
            recipients = [to_email]
            if cc_email:
                recipients.append(cc_email)
                
            server.sendmail(settings.EMAIL_USERNAME, recipients, message.as_string())
            
            logger.info(f"Email sent to {to_email} with subject '{subject}'")
            return True
            
    except smtplib.SMTPAuthenticationError:
        logger.error(
            "Gmail authentication failed. Please ensure you're using an App Password, not your regular password. "
            "To generate an App Password: "
            "1. Go to your Google Account > Security > 2-Step Verification > App passwords "
            "2. Select 'Mail' and 'Other (Custom name)' and enter 'TEVANI' "
            "3. Copy the generated 16-character password and set it as EMAIL_PASSWORD environment variable"
        )
        return False
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False
